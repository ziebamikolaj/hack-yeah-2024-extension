export type ApiResponse = {
  overallScore: number;
  ssl: true;
  userReviews: { reviewAverage: number };
  websiteAge: { age: string; score: number };
  breaches: { score: number };
};
