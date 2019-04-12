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
  }
});

var channelData;

function postTo(info) {
  return new Promise((resolve, reject) => {
    chrome.storage.sync.get(info.menuItemId, function(result) {
      resolve(result[info.menuItemId]);
    });
  });
}

chrome.contextMenus.onClicked.addListener(function(info, tab) {
  postTo(info).then(function(channelId) {
    if (info.parentMenuItemId === "post-image-to-telegram") {
      const Http = new XMLHttpRequest();
      const url = 'https://api.telegram.org/bot852628376:AAEPCDd7CLjzglphkaspQ3DISjGkKpTtHnM/sendPhoto?chat_id=' + channelId + '&photo=' + info.srcUrl;
      Http.open("POST", url);
      Http.send();
      Http.onreadystatechange = (e) => {
        console.log(Http.responseText)
      };
    };
  });
});