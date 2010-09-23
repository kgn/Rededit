const redditUrl = 'http://www.reddit.com';
const subRedditUrl = redditUrl+'/r/';
const userRedditUrl = redditUrl+'/user/';
const urlQueryUrl = redditUrl+'/api/info.json?url=';
const voteUrl = redditUrl+'/api/vote';
const submitUrl = redditUrl+'/submit?url='
const Bar = new _Bar;

function initialize(){
    Bar.initialize();
    Bar.update();
}

function respondToMessage(messageEvent){
	if(messageEvent.name === 'urlChanged'){
		Bar.update();
	}
}

safari.self.browserWindow.addEventListener('message', respondToMessage, false);



String.prototype.unescapeHtml = function(){
    var unescapeDiv = document.getElementById('unescape');
    unescapeDiv.innerHTML = this;
    return unescapeDiv.childNodes[0].nodeValue;
}

function isBlacklisted(url){
    var blacklist = safari.extension.settings.blacklist;
    if(typeof(blacklist) === 'undefined'){
        return false;
    }
    
	var lowerUrl = url.toLowerCase();
	var blacklistUrls = safari.extension.settings.blacklist.replace(',', ' ').split(' ');
	for(i=0; i<blacklistUrls.length; ++i){
		if(blacklistUrls[i] == ''){
			continue;
		}
		
		if(lowerUrl.indexOf(blacklistUrls[i].toLowerCase()) >= 0){
			return true;
		}
	}
	
	return false;
}

function _Bar(){
    this.initialize = function(){
        this.icon = document.getElementById('icon');
        this.submitted = document.getElementById('submitted');
        this.icon.href = redditUrl;
        this.status = document.getElementById('status');
        this.up = document.getElementById('up');
        this.score = document.getElementById('score');
        this.down = document.getElementById('down');
        this.submit = document.getElementById('submit');
        this.story = document.getElementById('story');
        this.storyinfo = document.getElementById('storyinfo');
        this.subreddit = document.getElementById('subreddit');
        this.author = document.getElementById('author');
        this.created = document.getElementById('created');
        this.nsfw = document.getElementById('nsfw');
        this.comments = document.getElementById('comments');
        this.blacklist = document.getElementById('blacklist');
    }
    
    this.update = function(){
        this.submit.style.display = 'none';
        this.submitted.style.display = 'none';
        this.blacklist.style.display = 'none';
        
        var tab = safari.self.browserWindow.activeTab;
        
        //url is undefined
        if(typeof(tab.url) === 'undefined'){
            return;
        }
        
        //url is in blacklist
        if(isBlacklisted(tab.url)){
            this.blacklist.style.display = 'inline-block';
            return;
        }
        
        var thisBar = this;
        xmlhttp = new XMLHttpRequest();
        xmlhttp.open('GET', urlQueryUrl+tab.url, true);
        xmlhttp.onreadystatechange = function(){
            if(xmlhttp.readyState == 4 && xmlhttp.status == 200){
                thisBar._update(JSON.parse(xmlhttp.responseText));
            }
        }
        xmlhttp.send();
    }
    
    this._update = function(json){
        var tab = safari.self.browserWindow.activeTab;
        
        //submit story
        if(typeof(json) === 'undefined' || typeof(json.data.children[0]) === 'undefined'){
            this.submit.href = submitUrl+tab.url+'&title='+tab.title;
            this.submit.style.display = 'inline-block';
            return;
        }
        
        //TODO: add support for displaying all the instances of this story on reddit
        //probbaly with previous and next buttons
        
        var data = json.data.children[0].data;
        
        //display the story with the highest score
        if(json.data.children.length > 1){
            var highScore = data.score;
            for(i=1; i<json.data.children.length; ++i){
                var childData = json.data.children[i].data;
                if(childData.score > highScore){
                    highScore = childData.score;
                    data = childData;
                }
            }
        }
        
        //score
		this.score.innerHTML = data.score;
		this.score.title = 'ups: '+data.ups+', downs: '+data.downs;
		
		//arrows
		//TODO: get voting working
		if(data.likes == true){
			this.up.className = 'up-active';
			this.up.title = 'un-vote';
			//this.up.href = '#';
			
			this.down.className = 'down';
			this.down.title = 'vote down';
			//this.down.href = '#';
		}else if(data.likes == false){
			this.up.className = 'up';
			this.up.title = 'vote up';
			//this.up.href = '#';
			
			this.down.className = 'down-active';
			this.down.title = 'un-vote';
			//this.down.href = '#';
		}else{
			this.up.className = 'up';
			this.up.title = 'vote up';
			//this.up.href = '#';
			
			this.down.className = 'down';
			this.down.title = 'vote down';
			//this.down.href = '#';
		}
		
		//story
		this.story.innerHTML = data.title;
		this.story.title = data.title.unescapeHtml();
		this.story.href = redditUrl+data.permalink;
		
		//story info
		var creationDate = new Date(data.created*1000);
		this.subreddit.innerHTML = data.subreddit;
		this.subreddit.href = subRedditUrl+data.subreddit;
		this.author.innerHTML = data.author;
		this.author.href = userRedditUrl+data.author;
		this.created.innerHTML = creationDate.toLocaleDateString();
		this.nsfw.style.display = data.over_18 ? 'inline-block' : 'none';
    			
    	//comments
		var commentStr = ' comment';
		if(data.num_comments > 1){
		    commentStr += 's';
		}
		if(data.num_comments > 99999){
			data.num_comments = '9999+';
		}
		
		this.comments.innerHTML = data.num_comments;
		this.comments.title = data.num_comments+commentStr;
		this.comments.className = 'comments'+data.num_comments.toString().length;
    			
		this.submitted.style.display = 'inline-block';
    }
};
