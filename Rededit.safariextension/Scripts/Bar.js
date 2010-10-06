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

function update(){
    Bar.update();
}

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
    this.jsonCache = null;
    
    this.initialize = function(){
        this.icon = document.getElementById('icon');
        this.submitted = document.getElementById('submitted');
        this.icon.href = redditUrl;
        this.status = document.getElementById('status');
        this.up = document.getElementById('up');
        this.score = document.getElementById('score');
        this.down = document.getElementById('down');
        this.submit = document.getElementById('submit');
        this.submitcount = document.getElementById('submitcount');
        this.resubmit = document.getElementById('resubmit');
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
        var tab = safari.self.browserWindow.activeTab;
        this._updateWithUrl(tab.url);
    }
    
    this._updateWithUrl = function(url){
        this.submit.className = 'hide';
        this.submitted.className = 'hide';
        this.blacklist.className = 'hide';
        
        //url is undefined
        if(typeof(url) === 'undefined'){
            return;
        }
        
        //url is in blacklist
        if(isBlacklisted(url)){
            this.blacklist.className = 'display';
            return;
        }
        
        var thisBar = this;
        xmlhttp = new XMLHttpRequest();
        xmlhttp.open('GET', urlQueryUrl+url, true);
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
            //if the url is from imgur try striping off 'i.'
            if(tab.url.indexOf('imgur.com') >= 0){
                imgurUrl = tab.url.match(/http:\/\/i\.(imgur.com.*)/i);
                if(imgurUrl){
                    this._updateWithUrl('http://'+imgurUrl[1]);
                    return;
                }
            }
            
            this.submit.href = submitUrl+tab.url+'&title='+tab.title;
            this.submit.className = 'display';
            this.jsonCache = null;
            return;
        }
        
        //TODO: add support for displaying all the instances of this story on reddit
        //probbaly with previous and next buttons
        
        var storyIndex = 0;
        this.jsonCache = json;
        
        //display the story with the highest score
        var highScore = this.jsonCache.data.children[0].data.score;
        for(i=0; i<this.jsonCache.data.children.length; ++i){
            var childData = this.jsonCache.data.children[i].data;
            if(childData.score > highScore){
                highScore = childData.score;
                storyIndex = i;
            }
        }
        
        this.displayStory(storyIndex);
    }
        
    this.displayStory = function(storyIndex){
        if(storyIndex+1 > this.jsonCache.data.children.length){
            storyIndex = 0;
        }
        
        var tab = safari.self.browserWindow.activeTab;
        var data = this.jsonCache.data.children[storyIndex].data;
        
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
		
		//resubmit
	    var submittedCountStr = 'Submitted '+this.jsonCache.data.children.length;
	    if(this.jsonCache.data.children.length == 1){
	        submittedCountStr += ' time';
	    }else{
	        submittedCountStr += ' times';
	    }
	    
	    this.submitcount.setAttribute('href', "javascript:Bar.displayStory("+(storyIndex+1)+")");
		this.submitcount.innerHTML = (storyIndex+1)+' of '+this.jsonCache.data.children.length;
		this.submitcount.setAttribute('title', submittedCountStr)
		this.resubmit.href = submitUrl+tab.url+'&resubmit=true&title='+tab.title;
		
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
		this.nsfw.style.display = data.over_18 ? 'inline' : 'none';
    			
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
    			
		this.submitted.className = 'display';
    }
};
