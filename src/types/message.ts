import { ApiResponse } from "./apiResponse";

export type messageScore = {
  action: string;
  score: string;
  details: ApiResponse;
};

export type messageUrl = {
  url: string;
  action: string;
};
