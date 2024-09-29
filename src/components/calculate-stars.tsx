interface StarsProps {
  readonly averageScore: number;
}

export default function CalculateStars({ averageScore }: StarsProps) {
  const roundedScore = Math.floor(averageScore * 2) / 2;
  const fullStars = Math.floor(roundedScore);
  const hasHalfStar = roundedScore % 1 !== 0;
  const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

  return (
    <>
      {[...Array<number>(fullStars)].map((_, index) => (
        <svg
          key={`full-${index}`}
          className="h-5 w-5 fill-current text-yellow-500"
          viewBox="0 0 24 24"
        >
          <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
        </svg>
      ))}
      {hasHalfStar && (
        <div className="relative">
          <svg
            className="h-5 w-5 fill-current text-yellow-500"
            viewBox="0 0 24 24"
            style={{ position: "absolute" }}
          >
            <defs>
              <clipPath id="half-star">
                <rect x="0" y="0" width="12" height="24" />
              </clipPath>
            </defs>
            <path
              d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"
              clipPath="url(#half-star)"
            />
          </svg>
          <svg
            className="h-5 w-5 fill-current text-gray-300"
            viewBox="0 0 24 24"
          >
            <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
          </svg>
        </div>
      )}
      {[...Array<number>(emptyStars)].map((_, index) => (
        <svg
          key={`empty-${index}`}
          className="h-5 w-5 fill-current text-gray-300"
          viewBox="0 0 24 24"
        >
          <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
        </svg>
      ))}
    </>
  );
}
