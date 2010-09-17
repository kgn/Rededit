//notify the extension bar that the url has changed
safari.self.tab.dispatchMessage('urlChanged', false);

//ask the global page what to inject based on the settings
function handleMessage(event){
    if(event.name == 'commentImages'){
        commentImages();
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
            //figure out the image url
            var imgUrl = null;
            if(links[i].href.match(/\.(jpg|jpeg|gif|png)$/i)){
                imgUrl = links[i].href;
            }else if(links[i].href.indexOf('imgur.com') >= 0){
                var imgurId = links[i].href.match(/[^\/]+$/);
                if(imgurId){
                    imgUrl = 'http://i.imgur.com/'+imgurId+'.jpg';
                }
            }
            
            //check to see if there is already an image in this link with the same src
            if(imgUrl){
                for(ii=0; ii<links[i].childNodes.length; ++ii){
                    var child = links[i].childNodes[ii];
                    if(child.nodeName == 'IMG' && child.src.toLowerCase() == imgUrl.toLowerCase()){
                        imgUrl = null;
                        break;
                    }
                }
            }
            
            //display the image
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
