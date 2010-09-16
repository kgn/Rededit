//There is a bug that causes a race condition where the 
//global page isn't fully loaded yet so Bar is not avalible :(
var Bar = null;
function setupBar(){
    if(Bar){
        return true;
    }
    
    if(Bar == null && safari.extension.globalPage.contentWindow.Bar){
        Bar = new safari.extension.globalPage.contentWindow.Bar;
        Bar.initialize(document);
        return true;
    }
    
    return false;
}

function update(){
    if(setupBar()){
        Bar.tab = safari.self.browserWindow.activeTab;
        Bar.update();
    }
}

function initialize(){
    setupBar();
    update();
}

function respondToMessage(messageEvent){
	if(messageEvent.name === 'urlChanged'){
		update();
	}
}

safari.self.browserWindow.addEventListener('message', respondToMessage, false);
