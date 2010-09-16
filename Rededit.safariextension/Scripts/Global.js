//Base reddit url
const redditUrl = 'http://www.reddit.com';

//Sub-reddit url
const subRedditUrl = redditUrl+'/r/';

//Sub-reddit url
const userRedditUrl = redditUrl+'/user/';

//Used to query information about a url
const urlQueryUrl = redditUrl+'/api/info.json?url=';

//Vote url
const voteUrl = redditUrl+'/api/vote';

//submit link
const submitUrl = redditUrl+'/submit?url='

String.prototype.unescapeHtml = function(){
    var unescapeDiv = document.getElementById('unescape');
    
    if(typeof(unescapeDiv) === 'undefined'){
        return this;
    }
    
    unescapeDiv.innerHTML = this;
    return unescapeDiv.childNodes[0].nodeValue;
}

function isBlacklisted(url){
    var blacklist = safari.extension.settings.blacklist;
    if(typeof(blacklist) === 'undefined'){
        return false;
    }
    
	var lowerUrl = url.toLowerCase();
	var blacklistUrls = safari.extension.settings.blacklist.replace(' ', ',').split(',');
	for(i = 0; i < blacklistUrls.length; ++i){
	    var blacklistUrl = blacklistUrls[i];
		if(blacklistUrl == ''){
			continue;
		}
		
		if(lowerUrl.indexOf(blacklistUrl.toLowerCase()) >= 0){
			return true;
		}
	}
	return false;
}

function Bar(){
    this.initialize = function(doc){
        this.icon = doc.getElementById('icon');
        this.submitted = doc.getElementById('submitted');
        this.icon.href = redditUrl;
        this.status = doc.getElementById('status');
        this.up = doc.getElementById('up');
        this.score = doc.getElementById('score');
        this.down = doc.getElementById('down');
        this.submit = doc.getElementById('submit');
        this.story = doc.getElementById('story');
        this.storyinfo = doc.getElementById('storyinfo');
        this.subreddit = doc.getElementById('subreddit');
        this.author = doc.getElementById('author');
        this.created = doc.getElementById('created');
        this.nsfw = doc.getElementById('nsfw');
        this.comments = doc.getElementById('comments');
        this.blacklist = doc.getElementById('blacklist');
    }
    
    this.update = function(){
        this.submit.style.display = 'none';
        this.submitted.style.display = 'none';
        this.blacklist.style.display = 'none';
        
        //url is undefined
        if(typeof(this.tab.url) === 'undefined'){
            return;
        }
        
        //url is in blacklist
        if(isBlacklisted(this.tab.url)){
            this.blacklist.style.display = 'inline-block';
            return;
        }
        
        var thisBar = this;
        xmlhttp = new XMLHttpRequest();
        xmlhttp.open('GET', urlQueryUrl+this.tab.url, true);
        xmlhttp.onreadystatechange = function(){
            if(xmlhttp.readyState == 4 && xmlhttp.status == 200){
                thisBar._update(JSON.parse(xmlhttp.responseText));
            }
        }
        xmlhttp.send();
    }
    
    this._update = function(json){
        //submit story
        if(typeof(json) === 'undefined' || typeof(json.data.children[0]) === 'undefined'){
            this.submit.href = submitUrl+this.tab.url+'&title='+this.tab.title;
            this.submit.style.display = 'inline-block';
            return;
        }
        
        var data = json.data.children[0].data;
        
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

//TODO: add a timer to updat the extension bars,
//because the bars currently only load when a webpage is loaded