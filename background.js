// Copyright 2018 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

//accessing map in array
/*var channelNames = ['Bot Test', 'Good Shit'];

chrome.storage.sync.set({ channelNames: channelNames }, function() {
    alert('Data saved');
});

chrome.storage.sync.get('channelNames', function(result) {
  result.channelNames.forEach(function(name) {
    alert(name);
  });
});

chrome.runtime.onInstalled.addListener(function () {
  alert("1");
  chrome.storage.sync.set(channels, function() {
    alert("2");
    chrome.storage.sync.get('channels', function(result) {
      alert(result[0]['Bot Test'] + " 3");
      result.forEach(function(update) {
        alert(update['Bot Test'] + " 4")
      });
    });
  });
});*/

chrome.contextMenus.create({
  id: "post-image-to-telegram",
  title: "Post Image to Telegram",
  contexts: ["image"],
});

var channelData;

function test(info) {
  return new Promise((resolve, reject) => {
    chrome.storage.sync.get('Bot Test', function(result) {
      channelData = result;
      resolve(info);
    });
  });
}

chrome.contextMenus.onClicked.addListener(function(info, tab) {
  test(info).then(function(info) {
    if (info.menuItemId === "post-image-to-telegram") {
      const Http = new XMLHttpRequest();
      const url = 'https://api.telegram.org/bot852628376:AAEPCDd7CLjzglphkaspQ3DISjGkKpTtHnM/sendPhoto?chat_id=' + channelData['Bot Test'] + '&photo=' + info.srcUrl;
      Http.open("POST", url);
      Http.send();
      Http.onreadystatechange = (e) => {
        console.log(Http.responseText)
      };
    };
  });
});