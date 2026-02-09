import { google } from "googleapis";

export interface GooglePlayReview {
  id: string;
  rating: number;
  title: string;
  body: string;
  reviewerNickname: string;
  createdDate: string;
  platform: "android";
  version: string;
}

export async function fetchGooglePlayReviews(): Promise<GooglePlayReview[]> {
  try {
    const credentialsPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;
    const packageName = process.env.GOOGLE_PLAY_PACKAGE!;

    if (!credentialsPath) {
      throw new Error("GOOGLE_APPLICATION_CREDENTIALS not set");
    }

    // Authenticate with Google
    const auth = new google.auth.GoogleAuth({
      keyFile: credentialsPath,
      scopes: ["https://www.googleapis.com/auth/androidpublisher"],
    });

    const androidpublisher = google.androidpublisher({
      version: "v3",
      auth,
    });

    // Fetch reviews
    const response = await androidpublisher.reviews.list({
      packageName,
      maxResults: 50,
    });

    if (!response.data.reviews) {
      return [];
    }

    return response.data.reviews.map((review: any) => {
      const comment = review.comments[0].userComment;
      return {
        id: review.reviewId,
        rating: comment.starRating,
        title: "",
        body: comment.text,
        reviewerNickname: review.authorName || "Anonymous",
        createdDate: comment.lastModified?.seconds
          ? new Date(comment.lastModified.seconds * 1000).toISOString()
          : new Date().toISOString(),
        platform: "android",
        version: comment.appVersionName || "Unknown",
      };
    });
  } catch (error) {
    console.error("Google Play API error:", error);
    return [];
  }
}
