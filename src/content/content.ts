import { messageScore, messageUrl } from "@/types/message";

import "../styles/globals.css";

chrome.runtime.onMessage.addListener((message: messageUrl | messageScore) => {
  if (message.action === "urlChanged") {
    chrome.runtime.sendMessage({
      action: "updatePopupUrl",
      url: (message as messageUrl).url,
    });
  }
});
