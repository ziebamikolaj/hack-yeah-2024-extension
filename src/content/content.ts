import { messageScore, messageUrl } from "@/types/message";

import "../styles/globals.css";

chrome.runtime.onMessage.addListener((message: messageUrl) => {
  if (message.action === "urlChanged") {
    chrome.runtime.sendMessage({
      action: "updatePopupUrl",
      url: message.url,
    });
  }
});

chrome.runtime.onMessage.addListener((message: messageScore) => {
  if (message.action === "scoreChanged") {
    chrome.action.setBadgeText({ text: message.score });
  }
});
