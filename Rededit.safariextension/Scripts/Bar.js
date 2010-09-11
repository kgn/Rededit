const globalData = safari.extension.globalPage.contentWindow;

var lastLoaded = null;

String.prototype.unescapeHtml = function(){
    var temp = document.createElement('div');
    temp.innerHTML = this;
    var result = temp.childNodes[0].nodeValue;
    temp.removeChild(temp.firstChild);
    return result;
}

function getVoteCall(id, voteHash, dir){
	return "javascript:vote({id:'"+id+"', vh:'"+voteHash+"', dir:"+dir+"})";
}

function vote(parameters){
	//TODO: figure out why this comes back with error.USER_REQUIRED
	$.ajax({
		type: 'POST',
		url: globalData.voteUrl,
		data: parameters, 
		dataType: 'json',
		success: function(myObj){
			for(myKey in myObj){
				alert ("myObj["+myKey +"] = "+myObj[myKey]);
			}
			updateBar();
		},
	});
}

function resetBar(){
	$('#score').css('display', 'none');
	
	$('#submit').css('display', 'none');
	
	$('#up').css('display', 'none');
	$('#down').css('display', 'none');
	
	$('#story').css('display', 'none');
	$('#storyinfo').css('display', 'none');
	
	$('#comments').css('display', 'none');
	
	$('#blacklist').css('display', 'none');
}

function updateBar(){
	var tabUrl = safari.self.browserWindow.activeTab.url;
	if(typeof(tabUrl) === 'undefined'){
		resetBar();
		return;
	}
	
	//don't show the toolbar for sites in the blacklist
	if(globalData.isInBlackList(tabUrl)){
		resetBar();
		$('#blacklist').css('display', 'inline-block');
		return;
	}
	
	var fullUrlQueryUrl = globalData.urlQueryUrl+tabUrl;
	//TODO: this is a bad way of doing this,
	//we need a better caching mechanism
	if(fullUrlQueryUrl == lastLoaded){
		return;
	}
	lastLoaded = fullUrlQueryUrl;
	
	$.ajax({
		url: fullUrlQueryUrl,
		dataType: 'json',
		success: function(json){		
			if(typeof(json.data.children[0]) === 'undefined'){
				resetBar();
				$submit = $('#submit');
				var title = safari.self.browserWindow.activeTab.title;
				$submit.attr('href', globalData.submitUrl+tabUrl+'&title='+title);
				$submit.css('display', 'inline-block');
				return;
			}
			
			var data = json.data.children[0].data;
			
			$('#submit').css('display', 'none');
			
			//score and arrows
			var $score = $('#score');
			$score.html(data.score);
			$score.attr('title', 'ups: '+data.ups+', downs: '+data.downs);
			$score.css('display', 'inline-block');
			
			var $up = $('#up');
			var $down = $('#down');
			if(data.likes == true){
				$up.attr('class', 'up-active');
				$up.attr('title', 'un-vote');
				$up.attr('href', getVoteCall(data.id, json.data.modhash, 0));
				
				$down.attr('class', 'down');
				$down.attr('title', 'vote down');
				$down.attr('href', getVoteCall(data.id, json.data.modhash, -1));
			}else if(data.likes == false){
				$up.attr('class', 'up');
				$up.attr('title', 'vote up');
				$up.attr('href', getVoteCall(data.id, json.data.modhash, 1));
				
				$down.attr('class', 'down-active');
				$down.attr('title', 'un-vote');
				$down.attr('href', getVoteCall(data.id, json.data.modhash, 0));
			}else{
				$up.attr('class', 'up');
				$up.attr('title', 'vote up');
				$up.attr('href', getVoteCall(data.id, json.data.modhash, 1));
				
				$down.attr('class', 'down');
				$down.attr('title', 'vote down');
				$down.attr('href', getVoteCall(data.id, json.data.modhash, -1));
			}
			$up.css('display', 'inline-block');
			$down.css('display', 'inline-block');
			
			//story
			var $story = $('#story');
			$story.html(data.title);
			$story.attr('title', data.title.unescapeHtml());
			$story.attr('href', globalData.redditUrl+data.permalink);
			$story.css('display', 'inline-block');
			
			var $author = $('#author')
			var $subreddit = $('#subreddit')
			var creationDate = new Date(data.created*1000);
			$subreddit.html(data.subreddit);
			$subreddit.attr('href', globalData.subRedditUrl+data.subreddit);
			$author.html(data.author);
			$author.attr('href', globalData.userRedditUrl+data.author);
			$('#created').html(creationDate.toLocaleDateString());
			$('#nsfw').css('display', data.over_18 ? 'inline-block' : 'none');
			$('#storyinfo').css('display', 'inline-block');
			
			//comments
			var commentStr = ' comment';
			if(data.num_comments > 1){
			    commentStr += 's';
			}
			if(data.num_comments > 99999){
				data.num_comments = '9999+';
			}
			
			var $comments = $('#comments');
			$comments.html(data.num_comments);
			$comments.attr('title', data.num_comments+commentStr);
			$comments.attr('class', 'comments'+data.num_comments.toString().length);
			$comments.css('display', 'inline-block');
			
			$('#blacklist').css('display', 'none');
		},
	});
}
