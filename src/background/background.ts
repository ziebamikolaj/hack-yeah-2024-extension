import { messageScore } from "@/types/message";

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === "complete" && tab.url) {
    chrome.tabs.sendMessage(tabId, {
      action: "urlChanged",
      url: tab.url,
    });
  }
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "requestScore") {
    // Here you would typically make an API call to get the real score
    // For this example, we'll just use a random number
    const score = Math.floor(Math.random() * 100);

    // Send the score back to the popup
    chrome.runtime.sendMessage({
      action: "updateScore",
      score: score.toString(),
    } as messageScore);
  }
});
