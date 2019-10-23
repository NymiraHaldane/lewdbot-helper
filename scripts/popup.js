var channelId = function(id) { val = id };
var channelField;
var userNameField;
var channelName = undefined;

try {
	$(document).ready(function(){
		listChannels();
		channelField = document.getElementById("channelName");
		userNameField = document.getElementById("userName");
		chrome.storage.sync.get('userName', function(name) {
			if (name.userName == undefined) {
				return;
			} else {
				userNameField.value = name.userName;
			};
		});
		channelField.addEventListener('keypress', listenChannelField);
		userNameField.addEventListener('keypress', listenUserField);
	});
} catch(error) {
	console.log(error);
};

function saveChannelField(textarea) {
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
	$("#channelGroup").append('<div class="channelListItem"><p class="channel">' +
					channel + '</p><img class="x" id="' + channel + '" src="images/x-24.png" height="14" width="14"></div>');
	document.getElementById(channel).addEventListener('click', function(e) {
		removeChannel(channel, e)
	});
};

function removeChannel(channel, elem) {
	document.getElementById(channel).parentElement.remove();
	elem.target.remove();
	removeChannelData(elem.target.id).then(function() {
		removeChannelName(elem.target.id);
	});
};

function listChannels() {
	chrome.storage.sync.get('channelNames', function(result) {
		if (result.channelNames == undefined) {
	    return;
	  } else {
	    result.channelNames.forEach(function(channel) {
				createListItem(channel);
			});
	  };
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
    contexts: ["image", "video"],
  });
};

function removeValue(arr, value) {
	return arr.filter(function(name) {
		return name != value;
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
			chrome.storage.sync.set({channelNames: names});
			resolve("success");
		});
	});
};

function removeChannelData(channel) {
	return new Promise((resolve, reject) => {
		chrome.storage.sync.remove(channel, function(result) {
			chrome.contextMenus.remove(channel);
			resolve("success");
		});
	});
};

function removeChannelName(channel) {
	chrome.storage.sync.get('channelNames', function(result) {
		var names = result.channelNames;
		result.channelNames = [];
		names = removeValue(names, channel);
		alert('Channel ' + channel + ' removed.');
		chrome.storage.sync.set({channelNames: names});
	});
};

function checkChannelExists(result) {
	return new Promise((resolve, reject) => {
		var user;
		var count = 0;
		chrome.storage.sync.get('userId', function(currentUser) {
			result.forEach(function(update) {
				if (update.message == undefined) {
					return;
				} else if (update.message.chat.type == 'private') {
					return;
				} else if ((update.message.chat.title.toLowerCase() == channelName.toLowerCase()) && (update.message.from.id == currentUser.userId)) {
					count++;
					channelId = update.message.chat.id;
				} else {
					return;
				};
			});
			if (count > 0) {
				resolve(true);
			} else {
				resolve(false);
			};
		});
	});
};

function getChannelId() {
	return new Promise((resolve, reject) => {
		var xmlhttp = new XMLHttpRequest();
		xmlhttp.onreadystatechange = function() {
			if (this.readyState == 4 && this.status == 200) {
				var channelData = JSON.parse(this.responseText);
				checkChannelExists(channelData.result).then(function(result) {
					if (result == true) {
						resolve(channelId);
					} else if (result == false) {
						alert('Channel ' + channelName + ' not found.')
					};
				});
			};
		};
		xmlhttp.open("GET", "https://api.telegram.org/bot852628376:AAEPCDd7CLjzglphkaspQ3DISjGkKpTtHnM/getUpdates", true);
		xmlhttp.send();
	});
};

function listenChannelField(e) {
	if (e.keyCode == 13) {
		saveChannelField(channelField);
		channelField.value = '';
	};
};

/* vvv Very Beta vvv */

function listenUserField(e) {
	if (e.keyCode == 13) {
		if (!userNameField.value) {
			alert("Please enter a username.");
			return;
		} else {
			checkUserValidity(userNameField.value).then((result) => {
				if (result == true) {
					alert("User saved!")
				} else if (result == false) {
					alert("User not found.\n\nMake sure you've spelled your name correctly and have recently sent a message to @lewdbot_bot")
				}
			});
		}
	};
};

function checkUserValidity(username) {
	return new Promise((resolve, reject) => {
		var userCheck = new XMLHttpRequest();
		userCheck.onreadystatechange = function() {
			if (this.readyState == 4 && this.status == 200) {
				var chatJSON = JSON.parse(this.responseText);
				if (chatJSON.result.length == 0) {
					resolve(false);
				} else {
					for (update of chatJSON.result) {
						if (update.message.chat.type == 'private' && update.message.chat.username == username) {
							chrome.storage.sync.set({userId: update.message.from.id});
							chrome.storage.sync.set({userName: update.message.chat.username});
							resolve(true);
						} else {
							resolve(false);
						}
					}
				}
			}
		}
		userCheck.open("GET", "https://api.telegram.org/bot852628376:AAEPCDd7CLjzglphkaspQ3DISjGkKpTtHnM/getUpdates", true);
		userCheck.send();
	});
};
