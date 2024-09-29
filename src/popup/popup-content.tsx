"use client";

import { useEffect, useState } from "react";
import { AlertTriangle, CheckCircle, ExternalLink } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ApiResponse } from "@/types/apiResponse";
import CalculateStars from "@/components/calculate-stars";

type ScoreData = ApiResponse | string | null;

const getDomainFromUrl = (url: string) => {
  try {
    const urlObj = new URL(url);
    return urlObj.hostname.replace(/^www\./, "");
  } catch {
    try {
      const urlObj = new URL(`https://${url}`);
      return urlObj.hostname.replace(/^www\./, "");
    } catch {
      console.error("Invalid URL:", url);
      return "";
    }
  }
};

export const PopupContent = () => {
  const [isEnabled, setIsEnabled] = useState(true);
  const [scoreData, setScoreData] = useState<ScoreData>(null);
  const [currentUrl, setCurrentUrl] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const url = tabs[0]?.url ?? "";
      const domain = getDomainFromUrl(url);
      setCurrentUrl(domain);

      if (domain && isEnabled) {
        chrome.storage.local.get(domain, (result) => {
          if (result[domain]) {
            setScoreData(result[domain]);
            setIsLoading(false);
          } else {
            chrome.runtime.sendMessage({ action: "fetchScore", url: domain });
          }
        });
      } else {
        setScoreData(null);
        setIsLoading(false);
      }
    });

    const messageListener = (message: {
      action: string;
      url?: string;
      data?: ApiResponse | string;
    }) => {
      if (message.action === "scoreUpdated" && message.url && message.data) {
        setCurrentUrl(message.url);
        setScoreData(message.data);
        setIsLoading(false);
      }
    };

    chrome.runtime.onMessage.addListener(messageListener);

    return () => {
      chrome.runtime.onMessage.removeListener(messageListener);
    };
  }, [isEnabled]);

  const getScoreColorClass = (score: number) => {
    if (score <= 30) return "bg-red-500 text-white";
    if (score <= 70) return "bg-yellow-500 text-black";
    return "bg-green-500 text-white";
  };

  const getScoreText = (score: number) => {
    if (score <= 30) return "Very Fishy";
    if (score <= 70) return "Proceed with Caution, can be fishy";
    return "Safe and Trustworthy, no fishes here";
  };

  const getProgressColorClass = (score: number) => {
    if (score <= 30) return "bg-red-500";
    if (score <= 70) return "bg-yellow-500";
    return "bg-green-500";
  };

  let content;
  if (isLoading) {
    content = (
      <div className="py-8 text-center">
        <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-b-2 border-t-2 border-blue-500"></div>
        <p className="text-sm text-gray-600">Fetching website information...</p>
      </div>
    );
  } else if (isEnabled && scoreData && typeof scoreData !== "string") {
    content = (
      <>
        <div className="mb-4">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-sm font-medium">Website</span>
            <span className="rounded px-2 py-1 text-sm" title={currentUrl}>
              {currentUrl}
            </span>
          </div>
          <div className="mb-2 flex items-center justify-between">
            <span className="text-sm font-medium">Trust Score</span>
            <span
              className={`text-sm font-bold ${getScoreColorClass(
                Math.round(scoreData.overallScore)
              )} rounded px-2 py-1`}
            >
              {Math.round(scoreData.overallScore)}
            </span>
          </div>
          <Progress
            value={scoreData.overallScore}
            className={`h-2 ${getProgressColorClass(scoreData.overallScore)}`}
          />
          <p className="mt-1 text-xs text-gray-500">
            {getScoreText(scoreData.overallScore)}
          </p>
        </div>

        <div className="mb-4 space-y-2">
          <div className="flex items-center">
            {scoreData.ssl ? (
              <>
                <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
                <span className="text-sm">SSL Secure</span>
              </>
            ) : (
              <>
                <AlertTriangle className="mr-2 h-4 w-4 text-yellow-500" />
                <span className="text-sm">Not Secured with SSL</span>
              </>
            )}
          </div>
          <div className="flex items-center">
            {scoreData.userReviews.reviewAverage > 2.7 ? (
              <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
            ) : (
              <AlertTriangle className="mr-2 h-4 w-4 text-yellow-500" />
            )}
            <span className="text-sm w-full justify-between flex">
              User Review Score
              <div className="flex">
                <CalculateStars
                  averageScore={scoreData.userReviews.reviewAverage}
                />
              </div>
            </span>
          </div>
          <div className="flex items-center">
            {scoreData.websiteAge.score > 70 ? (
              <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
            ) : (
              <AlertTriangle className="mr-2 h-4 w-4 text-yellow-500" />
            )}

            <span className="text-sm">
              Website Age {scoreData.websiteAge.age}
            </span>
          </div>
          <div className="flex items-center">
            {scoreData.breaches.score === 100 ? (
              <>
                <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
                <span className="text-sm">No data breaches detected</span>
              </>
            ) : (
              <>
                <AlertTriangle className="mr-2 h-4 w-4 text-yellow-500" />
                <span className="text-sm">
                  Detected a data breach in the past
                </span>
              </>
            )}
          </div>
        </div>

        <a
          href={`https://is-this-fishy.vercel.app/domain/${encodeURIComponent(
            currentUrl
          )}`}
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
  } else if (isEnabled && scoreData && typeof scoreData === "string") {
    content = (
      <div className="py-4 text-center">
        <AlertTriangle className="mx-auto mb-2 h-12 w-12 text-yellow-500" />
        <p className="mb-4 text-sm text-gray-600">
          {scoreData === "No domain found"
            ? "This domain is not in our database yet."
            : "Unable to fetch information for this website."}
        </p>
      </div>
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
          <img src="icon.png" width={40} height={40} alt="IsThisFishy logo" />
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
