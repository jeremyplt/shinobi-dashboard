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

function getPrivateKey(): string {
  const envKey = process.env.APPSTORE_PRIVATE_KEY;
  if (envKey) {
    // Next.js .env loader handles multi-line quoted values correctly
    // Just return the key as-is (it already has proper newlines)
    return envKey;
  }

  // Fallback: try to read from file
  try {
    const fs = require("fs");
    return fs.readFileSync(
      "/root/.openclaw/workspace/.credentials/appstore-key.p8",
      "utf-8"
    );
  } catch {
    throw new Error("App Store private key not available");
  }
}

function generateJWT(): string {
  const keyId = process.env.APPSTORE_KEY_ID;
  const issuerId = process.env.APPSTORE_ISSUER_ID;

  if (!keyId || !issuerId) {
    throw new Error("App Store Connect credentials not configured");
  }

  const privateKey = getPrivateKey();

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
      const text = await response.text();
      throw new Error(
        `App Store API error: ${response.status} - ${text.slice(0, 200)}`
      );
    }

    const data = await response.json();

    return (data.data || []).map(
      (review: {
        id: string;
        attributes: {
          rating: number;
          title?: string;
          body: string;
          reviewerNickname?: string;
          createdDate: string;
          appVersion?: string;
        };
      }) => ({
        id: review.id,
        rating: review.attributes.rating,
        title: review.attributes.title || "",
        body: review.attributes.body,
        reviewerNickname:
          review.attributes.reviewerNickname || "Anonymous",
        createdDate: review.attributes.createdDate,
        platform: "ios" as const,
        version: review.attributes.appVersion || "Unknown",
      })
    );
  } catch (error) {
    console.error("App Store API error:", error);
    return [];
  }
}
