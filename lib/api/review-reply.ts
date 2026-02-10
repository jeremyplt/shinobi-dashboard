/**
 * Reply to App Store and Google Play reviews
 */

import jwt from "jsonwebtoken";
import { google } from "googleapis";

// --- App Store Connect Reply ---

function getAppStorePrivateKey(): string {
  const envKey = process.env.APPSTORE_PRIVATE_KEY;
  if (envKey) return envKey;

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

function generateAppStoreJWT(): string {
  const keyId = process.env.APPSTORE_KEY_ID;
  const issuerId = process.env.APPSTORE_ISSUER_ID;
  if (!keyId || !issuerId) throw new Error("App Store credentials not configured");

  const privateKey = getAppStorePrivateKey();
  return jwt.sign({}, privateKey, {
    algorithm: "ES256",
    expiresIn: "20m",
    audience: "appstoreconnect-v1",
    issuer: issuerId,
    header: { alg: "ES256", kid: keyId, typ: "JWT" },
  });
}

/**
 * Reply to an App Store review.
 * Creates or updates the developer response.
 */
export async function replyToAppStoreReview(
  reviewId: string,
  responseBody: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const token = generateAppStoreJWT();

    // First check if a response already exists
    const checkRes = await fetch(
      `https://api.appstoreconnect.apple.com/v1/customerReviews/${reviewId}/response`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      }
    );

    if (checkRes.ok) {
      const existing = await checkRes.json();
      if (existing.data) {
        // Update existing response
        const updateRes = await fetch(
          `https://api.appstoreconnect.apple.com/v1/customerReviewResponses/${existing.data.id}`,
          {
            method: "PATCH",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              data: {
                type: "customerReviewResponses",
                id: existing.data.id,
                attributes: { responseBody },
              },
            }),
          }
        );

        if (!updateRes.ok) {
          const text = await updateRes.text();
          throw new Error(`Update failed: ${updateRes.status} - ${text.slice(0, 200)}`);
        }

        return { success: true };
      }
    }

    // Create new response
    const createRes = await fetch(
      `https://api.appstoreconnect.apple.com/v1/customerReviewResponses`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          data: {
            type: "customerReviewResponses",
            attributes: { responseBody },
            relationships: {
              review: {
                data: { type: "customerReviews", id: reviewId },
              },
            },
          },
        }),
      }
    );

    if (!createRes.ok) {
      const text = await createRes.text();
      throw new Error(`Create failed: ${createRes.status} - ${text.slice(0, 200)}`);
    }

    return { success: true };
  } catch (error) {
    console.error("App Store reply error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

// --- Google Play Reply ---

function getGoogleAuth() {
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

  const credentialsPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;
  if (credentialsPath) {
    return new google.auth.GoogleAuth({
      keyFile: credentialsPath,
      scopes: ["https://www.googleapis.com/auth/androidpublisher"],
    });
  }

  throw new Error("No Google credentials configured");
}

/**
 * Reply to a Google Play review.
 */
export async function replyToGooglePlayReview(
  reviewId: string,
  replyText: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const packageName = process.env.GOOGLE_PLAY_PACKAGE || "com.shinobiapp.shinobi";
    const auth = getGoogleAuth();

    const androidpublisher = google.androidpublisher({
      version: "v3",
      auth,
    });

    await androidpublisher.reviews.reply({
      packageName,
      reviewId,
      requestBody: {
        replyText,
      },
    });

    return { success: true };
  } catch (error) {
    console.error("Google Play reply error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
