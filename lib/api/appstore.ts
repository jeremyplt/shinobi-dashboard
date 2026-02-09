import jwt from "jsonwebtoken";

export interface AppStoreReview {
  id: string;
  rating: number;
  title: string;
  body: string;
  reviewerNickname: string;
  createdDate: string;
  platform: "ios";
  version: string;
}

function generateJWT(): string {
  const keyId = process.env.APPSTORE_KEY_ID!;
  const issuerId = process.env.APPSTORE_ISSUER_ID!;
  const privateKey = process.env.APPSTORE_PRIVATE_KEY!;

  const token = jwt.sign({}, privateKey, {
    algorithm: "ES256",
    expiresIn: "20m",
    audience: "appstoreconnect-v1",
    issuer: issuerId,
    header: {
      alg: "ES256",
      kid: keyId,
      typ: "JWT",
    },
  });

  return token;
}

export async function fetchAppStoreReviews(): Promise<AppStoreReview[]> {
  try {
    const token = generateJWT();
    const appId = "6479197432";

    const response = await fetch(
      `https://api.appstoreconnect.apple.com/v1/apps/${appId}/customerReviews?sort=-createdDate&limit=50`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      }
    );

    if (!response.ok) {
      throw new Error(`App Store API error: ${response.status}`);
    }

    const data = await response.json();

    return data.data.map((review: any) => ({
      id: review.id,
      rating: review.attributes.rating,
      title: review.attributes.title || "",
      body: review.attributes.body,
      reviewerNickname: review.attributes.reviewerNickname || "Anonymous",
      createdDate: review.attributes.createdDate,
      platform: "ios",
      version: review.attributes.appVersion || "Unknown",
    }));
  } catch (error) {
    console.error("App Store API error:", error);
    return [];
  }
}
