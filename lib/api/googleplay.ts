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

function getAuth() {
  // Try base64-encoded credentials first (Vercel)
  const credentialsBase64 = process.env.GOOGLE_APPLICATION_CREDENTIALS_BASE64;
  if (credentialsBase64) {
    const credentials = JSON.parse(
      Buffer.from(credentialsBase64, "base64").toString("utf-8")
    );
    return new google.auth.GoogleAuth({
      credentials,
      scopes: ["https://www.googleapis.com/auth/androidpublisher"],
    });
  }

  // Fallback to file path (local dev)
  const credentialsPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;
  if (credentialsPath) {
    return new google.auth.GoogleAuth({
      keyFile: credentialsPath,
      scopes: ["https://www.googleapis.com/auth/androidpublisher"],
    });
  }

  throw new Error("No Google credentials configured");
}

export async function fetchGooglePlayReviews(): Promise<GooglePlayReview[]> {
  try {
    const packageName = process.env.GOOGLE_PLAY_PACKAGE || "com.shinobiapp.shinobi";
    const auth = getAuth();

    const androidpublisher = google.androidpublisher({
      version: "v3",
      auth,
    });

    const response = await androidpublisher.reviews.list({
      packageName,
      maxResults: 50,
    });

    if (!response.data.reviews) {
      return [];
    }

    return response.data.reviews.map((review) => {
      const comment = review.comments?.[0]?.userComment;
      return {
        id: review.reviewId || "",
        rating: comment?.starRating || 0,
        title: "",
        body: comment?.text || "",
        reviewerNickname: review.authorName || "Anonymous",
        createdDate: comment?.lastModified?.seconds
          ? new Date(Number(comment.lastModified.seconds) * 1000).toISOString()
          : new Date().toISOString(),
        platform: "android" as const,
        version: comment?.appVersionName || "Unknown",
      };
    });
  } catch (error) {
    console.error("Google Play API error:", error);
    return [];
  }
}
