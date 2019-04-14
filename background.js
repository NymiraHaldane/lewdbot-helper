// Copyright 2018 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

chrome.contextMenus.create({
  id: "post-image-to-telegram",
  title: "Post to Channel",
  contexts: ["image"],
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
        contexts: ["image"],
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
  const url = 'https://api.telegram.org/bot852628376:AAEPCDd7CLjzglphkaspQ3DISjGkKpTtHnM/sendMessage?chat_id=' + channelId + '&text=%5BSource%5D%28' + tabUrl[0] + '&parse_mode=markdown&disable_web_page_preview=true';
  Http.open("POST", url);
  Http.send();
};

function getPageUrl() {
  return new Promise((resolve, reject) => {
    chrome.tabs.query({'active': true, 'lastFocusedWindow': true}, function(tabs) {
      var tabUrl = new URL(tabs[0].url);
      tabUrl = [tabUrl, tabUrl.hostname]
      resolve(tabUrl);
    });
  });
};

function sendImage(info, channelId) {
  return new Promise((resolve, reject) => {
    const Http = new XMLHttpRequest();
    const url = 'https://api.telegram.org/bot852628376:AAEPCDd7CLjzglphkaspQ3DISjGkKpTtHnM/sendPhoto?chat_id=' + channelId + '&photo=' + info.srcUrl;
    Http.open("POST", url);
    Http.send();
    resolve("success");
  });
};

chrome.contextMenus.onClicked.addListener(function(info, tab) {
  getTargetChannel(info).then(function(channelId) {
    if (info.parentMenuItemId === "post-image-to-telegram") {
      sendImage(info, channelId).then(function() {
        getPageUrl().then(function(tabUrl) {
          if (tabUrl[1] == 'e621.net') {
            sendMessage(info, channelId, tabUrl);
          } else {
            return;
          }
        });
      });
    };
  });
});
