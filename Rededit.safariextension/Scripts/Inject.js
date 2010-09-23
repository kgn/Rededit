const rededit_expando_child = "function next(elem){do{elem=elem.nextSibling;}while(elem && elem.className.indexOf('expando'));return elem;} function rededit_expando_child(node){var expando = next(node); if(expando.style.display == 'none'){expando.style.display = ''; node.className = 'rededit-image-expando expanded'}else{expando.style.display = 'none'; node.className = 'rededit-image-expando collapsed'}}";

//notify the extension bar that the url has changed
safari.self.tab.dispatchMessage('urlChanged', false);

//ask the global page what to inject based on the settings
var commentImagesRun = false;
var imageExpandoRun = false;
function handleMessage(event){
    if(event.name == 'commentImages' && !commentImagesRun){
        commentImages();
        commentImagesRun = true;
    }else if(event.name == 'imageExpando' && !imageExpandoRun){
        imageExpando();
        imageExpandoRun = true;
    }
}
safari.self.addEventListener('message', handleMessage, false);
safari.self.tab.dispatchMessage('injectWithSettings');

//FROM: http://www.netlobo.com/javascript-insertafter.html
function insertAfter(referenceNode, newNode){
    referenceNode.parentNode.insertBefore(newNode, referenceNode.nextSibling);
}

function getElementsByClassName(node, classname){
    var a = [];
    var re = new RegExp(' ' + classname + ' ');
    var els = node.getElementsByTagName('*');
    for(var i=0,j=els.length; i<j; i++){
        if(re.test(' '+els[i].className+' ')){
            a.push(els[i]);
        }
    }
    return a;
}

function commentImages(){
    var commentarea = getElementsByClassName(document, 'commentarea');
    if(commentarea && commentarea.length > 0){
        var links = commentarea[0].getElementsByTagName('a');
        for(i=0; i<links.length; ++i){
            var imgUrl = imageUrlFromLink(links[i]);
            if(imgUrl){
                var img = document.createElement('img');
                img.src = imgUrl;
                img.style.display = 'block';
                img.style.maxWidth = '600px';
                img.style.maxHeight = '600px';
                links[i].appendChild(img);
            }
        }
    }
}

function imageExpando(){
    //add the rededit_expando_child script to the document 
    //so it's avalible for the image expando button
    var head = document.getElementsByTagName('head')[0];
    var script = document.createElement('script');
    script.type = 'text/javascript';
    script.innerHTML = rededit_expando_child;
    head.appendChild(script);
    
    //find all entries in the correct content div
    var content = getElementsByClassName(document, 'content');
    for(c=0; c<content.length; ++c){
        //skip sidebar
        if(content[c].parentNode.className.indexOf('sidecontentbox') >= 0){
            continue;
        }
        
        var entries = getElementsByClassName(content[c], 'entry');
        for(e=0; e<entries.length; ++e){
            var links = entries[e].getElementsByTagName('a');
            var imgUrl = imageUrlFromLink(links[0]);
            if(imgUrl){
                //create button
                var div = document.createElement('div');
                div.className = 'rededit-image-expando collapsed';
                //we have to add this as a style because the reddit css is overriding this
                div.style.margin = '2px 5px 2px 0';
                div.setAttribute('onclick', "rededit_expando_child(this)");
                var title = getElementsByClassName(entries[e], 'title');
                insertAfter(title[0], div);
                
                //create image
                var img = document.createElement('img');
                img.src = imgUrl;
                img.style.display = 'block';
                img.style.maxWidth = '600px';
                img.style.maxHeight = '600px';
                var expando = getElementsByClassName(entries[e], 'expando');
                expando[0].appendChild(img);
                
                //remove loading span
                var spans = expando[0].getElementsByTagName('span');
                expando[0].removeChild(spans[0]);
            }
        }
    }
}

function imageUrlFromLink(linkElement){
    var imgUrl = null;
    if(linkElement.href.match(/\.(jpg|jpeg|gif|png)$/i)){
        imgUrl = linkElement.href;
    }else if(linkElement.href.indexOf('imgur.com') >= 0){
        var imgurId = linkElement.href.match(/[^\/]+$/);
        if(imgurId){
            imgurId = imgurId[0];
            if(imgurId.indexOf('?') >= 0){
                var imgurIdSplit = imgurId.split('?');
                imgurId = imgurIdSplit[0];
            }else if(imgurId.indexOf('&') >= 0){
                var imgurIdSplit = imgurId.split('&');
                imgurId = imgurIdSplit[imgurIdSplit.length-1];
            }
            imgUrl = 'http://i.imgur.com/'+imgurId+'.jpg';
        }
    }else{
        return null;
    }
    
    //check to see if there is already an image in this link with the same src
    for(ii=0; ii<linkElement.childNodes.length; ++ii){
        var child = linkElement.childNodes[ii];
        if(child.nodeName == 'IMG' && child.src.toLowerCase() == imgUrl.toLowerCase()){
            return null;
        }
    }
    
    return imgUrl;
}
