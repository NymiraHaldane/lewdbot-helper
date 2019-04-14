// Copyright 2018 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

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

function sendImage(info, channelId, tabUrl) {
  const Http = new XMLHttpRequest();
  const url = 'https://api.telegram.org/bot852628376:AAEPCDd7CLjzglphkaspQ3DISjGkKpTtHnM/sendPhoto?chat_id=' + channelId + '&photo=' + info.srcUrl;
  Http.open("POST", url);
  Http.send();
  Http.onreadystatechange = function() {
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
  Http.onreadystatechange = function() {
    if (this.readyState == 4 && this.status == 200) {
      sendMessage(info, channelId, tabUrl);
    };
  };
};

chrome.contextMenus.onClicked.addListener(function(info, tab) {
  if (info.parentMenuItemId === "post-image-to-telegram") {
    var tabUrl = new URL(tab.url);
    getTargetChannel(info).then(function(channelId) {
      alert(info.srcUrl.substring(info.srcUrl.lastIndexOf('.')+1));
      if (info.srcUrl.substring(info.srcUrl.lastIndexOf('.')+1) == ('gif' || 'webm' || 'mp4')) {
        sendVideo(info, channelId, tabUrl);
      } else {
        sendImage(info, channelId, tabUrl);
      };
    });
  };
});