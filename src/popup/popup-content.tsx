"use client";

import { useEffect, useState } from "react";
import { AlertTriangle, CheckCircle, ExternalLink, Shield } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { messageScore, messageUrl } from "@/types/message";

const getDomainFromUrl = (url: string) => {
  try {
    const urlObj = new URL(url);
    return urlObj.hostname.replace(/^www\./, "");
  } catch {
    console.error("Invalid URL:", url);
    return "";
  }
};

export const PopupContent = () => {
  const [isEnabled, setIsEnabled] = useState(true);
  const [score, setScore] = useState<number>();
  const [currentUrl, setCurrentUrl] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Get the current tab's URL when the popup is opened
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      setCurrentUrl(getDomainFromUrl(tabs[0]?.url ?? ""));
      // Simulate fetching data
      setTimeout(() => {
        setIsLoading(false);
      }, 1500);
    });

    // Listen for URL updates and score changes from the content script
    const messageListener = (message: messageUrl | messageScore) => {
      if (message.action === "updatePopupUrl") {
        setCurrentUrl(getDomainFromUrl((message as messageUrl).url));
      } else if (message.action === "updateScore") {
        setScore(parseInt((message as messageScore).score, 10));
        requestScoreUpdate();
        setIsLoading(false);
      }
    };

    chrome.runtime.onMessage.addListener(messageListener);

    // Cleanup listener on component unmount
    return () => {
      chrome.runtime.onMessage.removeListener(messageListener);
    };
  }, []);

  const getScoreColor = (score: number) => {
    if (score <= 30) return "bg-red-500";
    if (score <= 70) return "bg-yellow-500";
    return "bg-green-500";
  };

  const getScoreText = (score: number) => {
    if (score <= 30) return "Very Fishy";
    if (score <= 70) return "Proceed with Caution, can be fishy";
    return "Safe and Trustworthy, no fishes here";
  };

  const requestScoreUpdate = () => {
    chrome.runtime.sendMessage({ action: "scoreChanged", score: score });
  };

  let content;
  if (isLoading) {
    content = (
      <div className="py-8 text-center">
        <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-b-2 border-t-2 border-blue-500"></div>
        <p className="text-sm text-gray-600">Fetching website information...</p>
      </div>
    );
  } else if (isEnabled) {
    content = (
      <>
        <div className="mb-4">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-sm font-medium">Website:</span>
            <span className="rounded px-2 py-1 text-sm" title={currentUrl}>
              {currentUrl}
            </span>
          </div>
          <div className="mb-2 flex items-center justify-between">
            <span className="text-sm font-medium">Trust Score</span>
            <span
              className={`text-sm font-bold ${getScoreColor(score ?? 0)} rounded px-2 py-1 text-white`}
            >
              {score}
            </span>
          </div>
          <Progress value={score} className="h-2" />
          <p className="mt-1 text-xs text-gray-500">
            {getScoreText(score ?? 0)}
          </p>
        </div>

        <div className="mb-4 space-y-2">
          <div className="flex items-center">
            <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
            <span className="text-sm">SSL Certificate</span>
          </div>
          <div className="flex items-center">
            <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
            <span className="text-sm">Verified Ownership</span>
          </div>
          <div className="flex items-center">
            <AlertTriangle className="mr-2 h-4 w-4 text-yellow-500" />
            <span className="text-sm">Some suspicious reviews detected</span>
          </div>
        </div>

        <a
          href={`https://is-this-fishy.vercel.app/${currentUrl}`}
          className="flex w-full items-center justify-center rounded-md bg-blue-500 px-4 py-2 text-sm font-medium text-white transition-colors duration-300 hover:bg-blue-600"
          target="_blank"
          rel="noopener noreferrer"
        >
          View Full Report
          <ExternalLink className="ml-2 h-4 w-4" />
        </a>

        <div className="mt-4 border-t border-gray-200 pt-4">
          <p className="mb-4 text-xs text-gray-600">
            If you want to temporarily disable IsThisFishy, you can do so here.
            You can always re-enable it later.
          </p>
          <Button
            variant="outline"
            className="w-full"
            onClick={() => setIsEnabled(false)}
          >
            Disable IsThisFishy
          </Button>
        </div>
      </>
    );
  } else {
    content = (
      <div className="py-4 text-center">
        <AlertTriangle className="mx-auto mb-2 h-12 w-12 text-yellow-500" />
        <p className="mb-4 text-sm text-gray-600">
          IsThisFishy is currently disabled. Enable it to check store
          trustworthiness.
        </p>
        <Button onClick={() => setIsEnabled(true)}>Enable IsThisFishy</Button>
      </div>
    );
  }

  return (
    <div className="w-80 rounded-lg bg-white p-4 shadow-lg">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex w-full justify-between">
          <h1 className="text-ri text-lg font-bold">IsThisFishy</h1>
          <img src="icon.png" width={40} height={40}></img>
        </div>
      </div>

      {content}

      <div className="mt-4 border-t border-gray-200 pt-2">
        <a
          href="https://is-this-fishy.vercel.app/about"
          className="flex items-center justify-center text-xs text-blue-500 hover:underline"
        >
          Learn more about IsThisFishy
          <ExternalLink className="ml-1 h-3 w-3" />
        </a>
      </div>
    </div>
  );
};
