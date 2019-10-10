// Copyright 2018 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

var proxy = 'https://tranquil-coast-52470.herokuapp.com/';
var channelData;

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
      chrome.storage.sync.set({alert: 'conversion-finished'});
      var result = msg.data.MEMFS[0];
      toMP4(result.data).then(function(file) {
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
};

async function toMP4(videoData) {
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

function getTargetChannel(info) {
  return new Promise((resolve, reject) => {
    chrome.storage.sync.get(info.menuItemId, function(result) {
      resolve(result[info.menuItemId]);
    });
  });
};

function sendMessage(info, channelId, tabUrl) {
  var postUrl;
  if (tabUrl.hostname == 'e621.net') {
    postUrl = tabUrl;
  } else if (tabUrl.hostname == 'tweetdeck.twitter.com') {
    postUrl = info.linkUrl;
  } else {
    return;
  }
  const Http = new XMLHttpRequest();
  const url = 'https://api.telegram.org/bot852628376:AAEPCDd7CLjzglphkaspQ3DISjGkKpTtHnM/sendMessage?chat_id=' + channelId + '&text=%5BSource%5D%28' + postUrl + '&parse_mode=markdown&disable_web_page_preview=true&disable_notification=true';
  Http.open("POST", url);
  Http.send();
  console.log('sendMessage');
};

function sendWebm(info, channelId, tabUrl, video) {
  chrome.storage.sync.set({alert: 'sending-webm'});
  var formData = new FormData();
  formData.append('video', video);
  const Http = new XMLHttpRequest();
  const url = 'https://api.telegram.org/bot852628376:AAEPCDd7CLjzglphkaspQ3DISjGkKpTtHnM/sendVideo?chat_id=' + channelId + '&video';
  Http.open("POST", url);
  Http.send(formData);
  Http.onload = function() {
    if (this.readyState == 4 && this.status == 200) {
      chrome.storage.sync.set({alert: 'webm-sent'});
      sendMessage(info, channelId, tabUrl);
    };
  };
};

function sendVideo(info, channelId, tabUrl) {
  chrome.storage.sync.set({alert: 'sending-video'});
  const Http = new XMLHttpRequest();
  const url = 'https://api.telegram.org/bot852628376:AAEPCDd7CLjzglphkaspQ3DISjGkKpTtHnM/sendVideo?chat_id=' + channelId + '&video=' + info.srcUrl;
  console.log(url);
  Http.open("POST", url);
  Http.send();
  Http.onload = function() {
    if (this.readyState == 4 && this.status == 200) {
      chrome.storage.sync.set({alert: 'video-sent'});
      sendMessage(info, channelId, tabUrl);
    };
  };
};

function getImageSize(url, type) {
  return new Promise((resolve, reject) => {
    var imageFile = new XMLHttpRequest();
    imageFile.open('GET', proxy + url, true);
    imageFile.send();
    imageFile.onload = function() {
      if (this.status == 200) {
        resolve(imageFile.getResponseHeader('Content-Length'));
      };
    };
  });
};

function sendImageFile(info, channelId, tabUrl, image) {
  var formData = new FormData();
  formData.append('photo', image);
  const Http = new XMLHttpRequest();
  const url = 'https://api.telegram.org/bot852628376:AAEPCDd7CLjzglphkaspQ3DISjGkKpTtHnM/sendPhoto?chat_id=' + channelId + '&photo';
  Http.open("POST", url);
  Http.send(formData);
  Http.onload = function() {
    if (this.readyState == 4 && this.status == 200) {
      chrome.storage.sync.set({alert: 'image-sent'});
      sendMessage(info, channelId, tabUrl);
    } else if (this.status != 200) {
      chrome.storage.sync.set({alert: 'image-file-failed'});
    };
  };
};

function sendImage(info, channelId, tabUrl) {
  return new Promise((resolve, reject) => {
    const Http = new XMLHttpRequest();
    const url = 'https://api.telegram.org/bot852628376:AAEPCDd7CLjzglphkaspQ3DISjGkKpTtHnM/sendPhoto?chat_id=' + channelId + '&photo=' + info.srcUrl;
    Http.open("POST", url);
    Http.send();
    Http.onload = function() {
      if (this.status == 200) {
        chrome.storage.sync.set({alert: 'image-sent'});
        sendMessage(info, channelId, tabUrl);
      } else if (this.status != 200) {
        resolve();
      };
    };
  });
};

function compressImage(url) {
  return new Promise((resolve, reject) => {
    var content = '{ "source": { "url": "' + url + '" } }';
    var toCompress = new XMLHttpRequest();
    toCompress.open('POST', proxy + 'https://api.tinify.com/shrink', true);
    toCompress.setRequestHeader('Authorization', 'Basic OlNnOVRkWGc4UFl4M042dm1STWtnS2wyU3l2RWE2RU9a');
    toCompress.setRequestHeader('Content-Type', 'application/json');
    toCompress.send(content);
    toCompress.onload = function() {
      if (this.status == 201) {
        resolve(toCompress.getResponseHeader('Location'));
      } else if (this.status != 201) {
        chrome.storage.sync.set({alert: 'image-compress-failed'});
      };
    };
  });
};

function getImageFile(url, type) {
  console.log('getImageFile');
  console.log(url + ' url');
  return new Promise((resolve, reject) => {
    var imageFile = new XMLHttpRequest();
    imageFile.open('GET', proxy + url, true);
    imageFile.responseType = 'blob';
    imageFile.send();
    imageFile.onload = async function() {
      if (this.status == 200) {
        var image = await new File([imageFile.response], 'uncompressed.' + type,
          {type: imageFile.response.type, lastModified: Date.now()});
        resolve(image);
      } else if (this.status != 200) {
        chrome.storage.sync.set({alert: 'get-file-failed'});
      };
    };
  });
};

chrome.contextMenus.onClicked.addListener(function(info, tab) {
  if (info.parentMenuItemId === "post-image-to-telegram") {
    chrome.storage.sync.set({alert: ''}); // reset alert value in chrome storage
    var tabUrl = new URL(tab.url);
    var type = info.srcUrl.substring(info.srcUrl.lastIndexOf('.')+1);
    console.log(type);
    getTargetChannel(info).then(function(channelId) {
      // check if mp4/gif and send
      if (['gif', 'mp4'].includes(type)) {
        console.log('sendVideo');
        sendVideo(info, channelId, tabUrl);
      // check if webm and compress before sending
      } else if (type == 'webm') {
        chrome.storage.sync.set({alert: 'webm'});
        getWebm(info, channelId, tabUrl);
        console.log('sendWebm');
      // check if image and check size before sending
      } else if (['jpg', 'png', 'jpeg', 'jpg:large', 'png:large'].includes(type)) {
        chrome.storage.sync.set({alert: 'small-image'});
        getImageSize(info.srcUrl, type).then(function(size) {
          // if image is larger than 10mb, compress before sending
          if (size > 10485760) {
              console.log('big');
              chrome.storage.sync.set({alert: 'big-image'})
              /*compressImage(info.srcUrl).then(function(compressed) {
                getImageFile(compressed, type).then(function(file) {
                  sendImageFile(info, channelId, tabUrl, file);
                });
              });*/
          // if less than 10mb, send immediately
          } else {
            console.log('small');
            console.log('sendImage');
            sendImage(info, channelId, tabUrl).then(function() {
              console.log('getImageFile');
              chrome.storage.sync.set({alert: 'image-file'});
              getImageFile(info.srcUrl, type).then(function(file) {
                console.log('sendImageFile');
                sendImageFile(info, channelId, tabUrl, file);
              });
            });
            console.log({info, channelId, tabUrl});
            console.log(tabUrl.hostname);
          };
        });
      // if file doesn't match any of the accepted formats try sending as image and alert if failed
      } else {
        try {
          chrome.storage.sync.set({alert: 'unrecognized'});
          getImageFile(info.srcUrl).then(function(file) {
            sendImageFile(info, channelId, tabUrl, file);
          });
        } catch (error) {
          alert('File of type ' + type + ' failed to send.');
        }
      };
    });
  };
});
