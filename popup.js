var counter = 2;
var gottenChannel = undefined;
var channelId = function(id) { val = id; };;
var element;
var channelName = undefined;

try {
	$(document).ready(function(){

	  /*$("#addButton").click(function () {

			var newTextBoxDiv = $(document.createElement('div')).attr("id", 'channelName' + counter);

			newTextBoxDiv.after().html('<input type="textbox" id="channelName' + counter + 
			      '" name="channelName' + counter + '" placeholder="Channel Name">');

			newTextBoxDiv.appendTo("#text-boxes-group");

			counter++;
		});*/

		element = document.getElementById("channelName");

		element.addEventListener('keypress', getKeyPress);

		chrome.storage.sync.get('Bot Test', function(result) {
			if (result == undefined) {
				return null;
			} else {
				element.value = result['Bot Test'];
			};
		});
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

		chrome.storage.sync.set(data, function() {
			alert('Channel ' + channelName + ' saved.');
		});

		chrome.storage.sync.get('channelNames', function(result) {
			var names = result.channelNames;
			result.channelNames = [];
			if (names == undefined) {
				names = [channelName];
			} else if (names.includes(channelName)) {
				return;
			} else {
				names.push(channelName);
			};
			result.channelNames = names;
			chrome.storage.sync.set({channelNames: result.channelNames}, function() {
				alert('saved');
			});
		});
	});
};

function getChannels() {
	return new Promise((resolve, reject) => {

	});
};

function getChannelId(callback) {
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
		  	try {
		  		callback.apply(channelId,[id]);
			} catch(error) {
				console.error(error);
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