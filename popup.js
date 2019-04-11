var counter = 2;
var gottenChannel = undefined;
var channelId = function(id) { val = id; };;
var element;
var channelName = undefined;

try {
	$(document).ready(function(){
		listChannels();
		element = document.getElementById("channelName");
		element.addEventListener('keypress', getKeyPress);
	});
}
catch(error) {
	console.error(error);
};

function saveChanges(textarea) {
	// Get a value saved in the Channel field.
	channelName = textarea.value;

	if (!channelName) {
		alert('Please enter a channel name.');
		return;
	};

	getChannelId().then(function(result) {
		var data = {};

		data[channelName] = channelId;

		setChannelName().then(function(result) {
			setChannelData(data);
		});
	});
};

function createListItem(channel) {
	$("#channelGroup").append('<p class="channel">' + channel + '</p>');
};

function listChannels() {
	chrome.storage.sync.get('channelNames', function(result) {
		result.channelNames.forEach(function(channel) {
			createListItem(channel);
		});
	});
};

function setChannelData(data) {
	chrome.storage.sync.set(data, function() {
	});
};

function createChannelMenu(channel) {
  chrome.contextMenus.create({
    parentId: "post-image-to-telegram",
    id: channel,
    title: 'Post to ' + channel,
    contexts: ["image"],
  });
};

//TODO clean up setChannelName
function setChannelName() {
	return new Promise((resolve, reject) => {
		chrome.storage.sync.get('channelNames', function(result) {
			var names = result.channelNames;
			result.channelNames = [];
			if (names == undefined) {
				names = [channelName];
				alert('Channel ' + channelName + ' saved.');
				createListItem(channelName);
				createChannelMenu(channelName);
			} else if (names.includes(channelName)) {
				alert('Channel ' + channelName + ' already exists.')
				return;
			} else {
				names.push(channelName);
				alert('Channel ' + channelName + ' saved.');
				createListItem(channelName);
				createChannelMenu(channelName);
			};
			result.channelNames = names;
			chrome.storage.sync.set({channelNames: result.channelNames});
			resolve("success");
		});
	});
};

function getChannelId() {
	return new Promise((resolve, reject) => {
		var xmlhttp = new XMLHttpRequest();
		xmlhttp.onreadystatechange = function() {
			if (this.readyState == 4 && this.status == 200) {
				var channelData = JSON.parse(this.responseText);
				channelData.result.forEach(function(update) {
					if (update.message.chat.title.toLowerCase() == channelName.toLowerCase()) {
						channelId = update.message.chat.id;
						resolve(channelId);
					};
				});
			};
		};
		xmlhttp.open("GET", "https://api.telegram.org/bot852628376:AAEPCDd7CLjzglphkaspQ3DISjGkKpTtHnM/getUpdates", true);
		xmlhttp.send();
	});
};

function getKeyPress(e){
	if(e.keyCode == 13){
		saveChanges(element);
	};
};