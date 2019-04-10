// Copyright 2018 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

chrome.contextMenus.create({
  id: "post-image-to-telegram",
  title: "Post Image to Telegram",
  contexts: ["image"],
});

var channelData;

function test(info) {
  return new Promise((resolve, reject) => {
    chrome.storage.sync.get('channelName', function(result) {
      channelData = result;
      resolve(info);
    });
  });
}

chrome.contextMenus.onClicked.addListener(function(info, tab) {
  test(info).then(function(info) {
    if (info.menuItemId === "post-image-to-telegram") {
      const Http = new XMLHttpRequest();
      const url = 'https://api.telegram.org/bot852628376:AAEPCDd7CLjzglphkaspQ3DISjGkKpTtHnM/sendPhoto?chat_id=' + channelData.channelName[1] + '&photo=' + info.srcUrl;
      Http.open("POST", url);
      Http.send();
      Http.onreadystatechange = (e) => {
        console.log(Http.responseText)
      };
    };
  });
});