import { ApiResponse } from "@/types/apiResponse";

const getDomainFromUrl = (url: string) => {
  try {
    const urlObj = new URL(url);
    return urlObj.hostname.replace(/^www\./, "");
  } catch {
    console.error("Invalid URL:", url);
    return "";
  }
};

const updateBadge = (score: number) => {
  console.log(score);
  if (score === undefined) {
    chrome.action.setBadgeText({ text: "" });
  } else {
    const roundedScore = Math.round(score).toString();
    chrome.action.setBadgeText({ text: roundedScore });
    chrome.action.setBadgeBackgroundColor({ color: getScoreColor(score) });
  }
};

const getScoreColor = (score: number) => {
  if (score <= 30) return "#EF4444";
  if (score <= 70) return "#F59E0B";
  return "#10B981";
};

const fetchAndUpdateScore = (url: string) => {
  const domain = getDomainFromUrl(url);
  if (!domain) return;

  fetch(`https://is-this-fishy.vercel.app/api/domain/${domain}`)
    .then((res) => res.text())
    .then((data) => {
      if (data === "No domain found") {
        chrome.action.setBadgeText({ text: "?" });
        chrome.action.setBadgeBackgroundColor({ color: "#9CA3AF" });
        chrome.storage.local.set({ [domain]: { error: "No domain found" } });
        chrome.runtime.sendMessage({
          action: "scoreUpdated",
          url: domain,
          data: { error: "No domain found" },
        });
      } else {
        const jsonData: ApiResponse = JSON.parse(data);
        updateBadge(jsonData.overallScore);
        chrome.storage.local.set({ [domain]: jsonData });
        chrome.runtime.sendMessage({
          action: "scoreUpdated",
          url: domain,
          data: jsonData,
        });
      }
    })
    .catch((error) => {
      console.error("Error fetching score:", error);
      chrome.action.setBadgeText({ text: "!" });
      chrome.action.setBadgeBackgroundColor({ color: "#EF4444" }); // red-500
      chrome.storage.local.set({
        [domain]: { error: "Failed to fetch score" },
      });
      chrome.runtime.sendMessage({
        action: "scoreUpdated",
        url: domain,
        data: { error: "Failed to fetch score" },
      });
    });
};

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === "complete" && tab.url) {
    fetchAndUpdateScore(tab.url);
  }
});

chrome.tabs.onActivated.addListener((activeInfo) => {
  chrome.tabs.get(activeInfo.tabId, (tab) => {
    if (tab.url) {
      fetchAndUpdateScore(tab.url);
    }
  });
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
    return true;
  }
});

chrome.runtime.onMessage.addListener((message) => {
  if (message.action === "fetchScore") {
    fetchAndUpdateScore(message.url);
  }
});
