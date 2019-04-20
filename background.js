// Copyright 2018 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

var proxy = 'https://tranquil-coast-52470.herokuapp.com/';

function getWebm(info, channelId, tabUrl) {
  var worker = new Worker("./node_modules/ffmpeg.js/ffmpeg-worker-mp4.js");
  worker.onmessage = function(e) {
    var msg = e.data;
    console.log( msg.type );
    switch (msg.type) {
    case "ready":
      console.log('ready');
      // create request
      var request = new XMLHttpRequest();
      //set url to heroku cors proxy and specify response type
      request.open('GET', proxy + info.srcUrl, true);
      request.responseType = 'blob';
      //wait for request to load
      request.onload = function() {
        console.log({ request });
        //create new fileReader and save request response as arraybuffer
        var reader = new FileReader();
        reader.readAsArrayBuffer(request.response);
        //once arraybuffer is loaded, pass into conversion
        reader.onload =  function(e) {
          //post webm data to worker
          worker.postMessage({
            type: "run",
            MEMFS: [{name: "test.webm", data: e.target.result}],
            TOTAL_MEMORY: 256 * 1024 * 1024,
            arguments: ["-i", "test.webm", "-preset", "veryfast", "output.mp4"],
          });
        };
      };
      request.send();
      break;
    case "stdout":
      console.log(msg.data + '\n');
      break;
    case "stderr":
      console.log(msg.data + '\n');
      break;
    case "done":
      var result = msg.data.MEMFS[0];
      toFile(result.data).then(function(file) {
        sendWebm(info, channelId, tabUrl, file);
      });
      console.log("Converted webm returned from worker.");
      worker.terminate();
      break;
    case "exit":
      console.log("Process exited with code " + msg.data);
      break;
    };
  };
  console.log('EXITED FUNCTION');
};

async function toFile(videoData) {
  var file = await new File([videoData], 'converted.mp4', {type: 'video/mp4', lastModified: Date.now()});
  return new Promise((resolve, reject) => {
    resolve(file);
  });
}

chrome.contextMenus.create({
  id: "post-image-to-telegram",
  title: "Post to Channel",
  contexts: ["image", "video"],
});

chrome.storage.sync.get('channelNames', function(result) {
  if (result.channelNames == undefined) {
    return;
  } else {
    result.channelNames.forEach(function(channel) {
      chrome.contextMenus.create({
        parentId: "post-image-to-telegram",
        id: channel,
        title: 'Post to ' + channel,
        contexts: ["image", "video"],
      });
    });
  };
});

var channelData;

function getTargetChannel(info) {
  return new Promise((resolve, reject) => {
    chrome.storage.sync.get(info.menuItemId, function(result) {
      resolve(result[info.menuItemId]);
    });
  });
};

function sendMessage(info, channelId, tabUrl) {
  const Http = new XMLHttpRequest();
  const url = 'https://api.telegram.org/bot852628376:AAEPCDd7CLjzglphkaspQ3DISjGkKpTtHnM/sendMessage?chat_id=' + channelId + '&text=%5BSource%5D%28' + tabUrl + '&parse_mode=markdown&disable_web_page_preview=true';
  Http.open("POST", url);
  Http.send();
};

async function sendWebm(info, channelId, tabUrl, video) {
  var formData = new FormData();
  console.log({ info, channelId, tabUrl, video });
  formData.append('video', video);
  const Http = new XMLHttpRequest();
  const url = 'https://api.telegram.org/bot852628376:AAEPCDd7CLjzglphkaspQ3DISjGkKpTtHnM/sendVideo?chat_id=' + channelId + '&video';
  Http.open("POST", url);
  Http.send(formData);
  Http.onload = function() {
    if (this.readyState == 4 && this.status == 200) {
      sendMessage(info, channelId, tabUrl);
    };
  };
};

function sendImage(info, channelId, tabUrl) {
  const Http = new XMLHttpRequest();
  const url = 'https://api.telegram.org/bot852628376:AAEPCDd7CLjzglphkaspQ3DISjGkKpTtHnM/sendPhoto?chat_id=' + channelId + '&photo=' + info.srcUrl;
  Http.open("POST", url);
  Http.send();
  Http.onload = function() {
    if (this.readyState == 4 && this.status == 200) {
      sendMessage(info, channelId, tabUrl);
    };
  };
};

function sendVideo(info, channelId, tabUrl) {
  const Http = new XMLHttpRequest();
  const url = 'https://api.telegram.org/bot852628376:AAEPCDd7CLjzglphkaspQ3DISjGkKpTtHnM/sendVideo?chat_id=' + channelId + '&video=' + info.srcUrl;
  Http.open("POST", url);
  Http.send();
  Http.onload = function() {
    if (this.readyState == 4 && this.status == 200) {
      sendMessage(info, channelId, tabUrl);
    };
  };
};

chrome.contextMenus.onClicked.addListener(function(info, tab) {
  if (info.parentMenuItemId === "post-image-to-telegram") {
    var tabUrl = new URL(tab.url);
    console.log(info.srcUrl.substring(info.srcUrl.lastIndexOf('.')+1));
    getTargetChannel(info).then(function(channelId) {
      if (info.srcUrl.substring(info.srcUrl.lastIndexOf('.')+1) == ('gif' || 'mp4')) {
        sendVideo(info, channelId, tabUrl);
      } else if (info.srcUrl.substring(info.srcUrl.lastIndexOf('.')+1) == ('webm')) {
        getWebm(info, channelId, tabUrl);
      } else {
        sendImage(info, channelId, tabUrl);
      };
    });
  };
});
