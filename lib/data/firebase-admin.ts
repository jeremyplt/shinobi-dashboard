/**
 * Firestore access via Google Auth + REST API
 * Avoids heavy firebase-admin dependency that causes OOM in Turbopack builds
 * Uses the googleapis library already installed for Google Play integration
 */

import { google } from "googleapis";

const FIREBASE_PROJECT_ID = process.env.FIREBASE_PROJECT_ID || "shinobi-a2fed";

function getAuth() {
  const credentialsBase64 = process.env.GOOGLE_APPLICATION_CREDENTIALS_BASE64;
  if (credentialsBase64) {
    const credentials = JSON.parse(
      Buffer.from(credentialsBase64, "base64").toString("utf-8")
    );
    return new google.auth.GoogleAuth({
      credentials,
      scopes: ["https://www.googleapis.com/auth/datastore"],
    });
  }

  const credentialsPath =
    process.env.GOOGLE_APPLICATION_CREDENTIALS ||
    "/root/.openclaw/workspace/.credentials/firebase-shinobi.json";
  return new google.auth.GoogleAuth({
    keyFile: credentialsPath,
    scopes: ["https://www.googleapis.com/auth/datastore"],
  });
}

const BASE_URL = `https://firestore.googleapis.com/v1/projects/${FIREBASE_PROJECT_ID}/databases/(default)/documents`;

async function getAuthHeaders(): Promise<Record<string, string>> {
  const auth = getAuth();
  const client = await auth.getClient();
  const token = await client.getAccessToken();
  return {
    Authorization: `Bearer ${token.token}`,
    "Content-Type": "application/json",
  };
}

// --- Firestore Value Helpers ---

interface FirestoreValue {
  stringValue?: string;
  integerValue?: string;
  doubleValue?: number;
  timestampValue?: string;
  nullValue?: string;
  booleanValue?: boolean;
  mapValue?: { fields: Record<string, FirestoreValue> };
  arrayValue?: { values: FirestoreValue[] };
}

function parseFirestoreValue(val: FirestoreValue): unknown {
  if (val.stringValue !== undefined) return val.stringValue;
  if (val.integerValue !== undefined) return parseInt(val.integerValue);
  if (val.doubleValue !== undefined) return val.doubleValue;
  if (val.timestampValue !== undefined) return new Date(val.timestampValue);
  if (val.booleanValue !== undefined) return val.booleanValue;
  if (val.nullValue !== undefined) return null;
  if (val.mapValue) {
    const obj: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(val.mapValue.fields || {})) {
      obj[k] = parseFirestoreValue(v);
    }
    return obj;
  }
  if (val.arrayValue) {
    return (val.arrayValue.values || []).map(parseFirestoreValue);
  }
  return null;
}

function parseDocument(doc: {
  name: string;
  fields?: Record<string, FirestoreValue>;
}): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  if (doc.fields) {
    for (const [key, val] of Object.entries(doc.fields)) {
      result[key] = parseFirestoreValue(val);
    }
  }
  // Extract document ID from name
  const parts = doc.name.split("/");
  result._id = parts[parts.length - 1];
  return result;
}

// --- Public API ---

export interface FirestoreQuery {
  collection: string;
  where?: Array<{
    field: string;
    op: string;
    value: FirestoreValue;
  }>;
  orderBy?: Array<{
    field: string;
    direction: "ASCENDING" | "DESCENDING";
  }>;
  select?: string[];
  limit?: number;
  offset?: number;
}

/**
 * Run a structured query against Firestore
 */
export async function runQuery(
  query: FirestoreQuery
): Promise<Record<string, unknown>[]> {
  const headers = await getAuthHeaders();

  const structuredQuery: Record<string, unknown> = {
    from: [{ collectionId: query.collection }],
  };

  if (query.where && query.where.length > 0) {
    if (query.where.length === 1) {
      const w = query.where[0];
      structuredQuery.where = {
        fieldFilter: {
          field: { fieldPath: w.field },
          op: w.op,
          value: w.value,
        },
      };
    } else {
      structuredQuery.where = {
        compositeFilter: {
          op: "AND",
          filters: query.where.map((w) => ({
            fieldFilter: {
              field: { fieldPath: w.field },
              op: w.op,
              value: w.value,
            },
          })),
        },
      };
    }
  }

  if (query.orderBy && query.orderBy.length > 0) {
    structuredQuery.orderBy = query.orderBy.map((o) => ({
      field: { fieldPath: o.field },
      direction: o.direction,
    }));
  }

  if (query.select && query.select.length > 0) {
    structuredQuery.select = {
      fields: query.select.map((f) => ({ fieldPath: f })),
    };
  }

  if (query.limit) {
    structuredQuery.limit = query.limit;
  }

  if (query.offset) {
    structuredQuery.offset = query.offset;
  }

  const url = `https://firestore.googleapis.com/v1/projects/${FIREBASE_PROJECT_ID}/databases/(default)/documents:runQuery`;

  const res = await fetch(url, {
    method: "POST",
    headers,
    body: JSON.stringify({ structuredQuery }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Firestore query failed: ${res.status} - ${text.slice(0, 200)}`);
  }

  const results = await res.json();
  return results
    .filter((r: { document?: unknown }) => r.document)
    .map((r: { document: { name: string; fields?: Record<string, FirestoreValue> } }) =>
      parseDocument(r.document)
    );
}

/**
 * Run an aggregation query (COUNT)
 */
export async function runAggregation(
  collection: string,
  where?: FirestoreQuery["where"]
): Promise<number> {
  const headers = await getAuthHeaders();

  const structuredQuery: Record<string, unknown> = {
    from: [{ collectionId: collection }],
  };

  if (where && where.length > 0) {
    if (where.length === 1) {
      const w = where[0];
      structuredQuery.where = {
        fieldFilter: {
          field: { fieldPath: w.field },
          op: w.op,
          value: w.value,
        },
      };
    } else {
      structuredQuery.where = {
        compositeFilter: {
          op: "AND",
          filters: where.map((w) => ({
            fieldFilter: {
              field: { fieldPath: w.field },
              op: w.op,
              value: w.value,
            },
          })),
        },
      };
    }
  }

  const url = `https://firestore.googleapis.com/v1/projects/${FIREBASE_PROJECT_ID}/databases/(default)/documents:runAggregationQuery`;

  const res = await fetch(url, {
    method: "POST",
    headers,
    body: JSON.stringify({
      structuredAggregationQuery: {
        structuredQuery,
        aggregations: [
          {
            count: {},
            alias: "count",
          },
        ],
      },
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(
      `Firestore aggregation failed: ${res.status} - ${text.slice(0, 200)}`
    );
  }

  const results = await res.json();
  const countResult = results?.[0]?.result?.aggregateFields?.count;
  return parseInt(countResult?.integerValue || "0");
}
