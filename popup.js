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

		chrome.storage.sync.get('channelName', function(result) {
			if (result == undefined) {
				return null;
			} else {
			  element.value = result.channelName[0];
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
		if (result == undefined) {
			alert('No channel with name ' + channelName + ' found.');
		}
	  chrome.storage.sync.set({channelName: [channelName, channelId]}, function() {
	    alert('Channel ' + channelName + ' saved.');
	  });
	});
};

function getChannelId(callback) {
	return new Promise((resolve, reject) => {
		var xmlhttp = new XMLHttpRequest();
		xmlhttp.onreadystatechange = function() {
		  if (this.readyState == 4 && this.status == 200) {
		    var channelData = JSON.parse(this.responseText);
		    channelData.result.forEach(function(update) {
		    	if (update.message.chat.title == channelName) {
		    		channelId = update.message.chat.id;
		    		resolve(channelId);
		    	};
		    });
		  };
		  try {
		  	callback.apply(channelId,[id]);
			}
			catch(error) {
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