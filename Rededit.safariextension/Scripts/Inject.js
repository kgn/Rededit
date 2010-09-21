//notify the extension bar that the url has changed
safari.self.tab.dispatchMessage('urlChanged', false);

//ask the global page what to inject based on the settings
var commentImagesRun = false;
function handleMessage(event){
    if(event.name == 'commentImages' && !commentImagesRun){
        commentImages();
        commentImagesRun = true;
    }
}
safari.self.addEventListener('message', handleMessage, false);
safari.self.tab.dispatchMessage('injectWithSettings');

//FROM: http://www.snook.ca/archives/javascript/your_favourite_1
function getElementsByClassName(node, classname){
    var a = [];
    var re = new RegExp('\\b' + classname + '\\b');
    var els = node.getElementsByTagName("*");
    for(var i=0,j=els.length; i<j; i++)
        if(re.test(els[i].className))a.push(els[i]);
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
