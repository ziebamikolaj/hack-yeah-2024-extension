import { ApiResponse } from "@/types/apiResponse";

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === "complete" && tab.url) {
    chrome.tabs.sendMessage(tabId, {
      action: "urlChanged",
      url: tab.url,
    });
  }
});

chrome.runtime.onMessage.addListener((message, sender, senderResponse) => {
  if (message.action === "requestScore") {
    fetch(`https://is-this-fishy.vercel.app/api/domain/${message.url}`, {
      method: "GET",
    })
      .then((res) => res.text())
      .then((data) => {
        if (data === "No domain found") {
          // Handle the "No domain found" case
          const errorResponse = { error: "No domain found" };
          chrome.runtime.sendMessage({
            action: "updateScore",
            error: "No domain found",
          });
          senderResponse(errorResponse);
        } else {
          // If it's not the error string, parse it as JSON
          const jsonData: ApiResponse = JSON.parse(data);
          chrome.runtime.sendMessage({
            action: "updateScore",
            score: jsonData.overallScore.toString(),
            details: jsonData,
          });
          senderResponse(jsonData);
        }
      })
      .catch((error) => {
        console.error("Error fetching score:", error);
        const errorResponse = { error: "Failed to fetch score" };
        chrome.runtime.sendMessage({
          action: "updateScore",
          error: "Failed to fetch score",
        });
        senderResponse(errorResponse);
      });
    return true; // Indicates that the response is sent asynchronously
  }
});
