const SQUARE_VERSION = "2026-09-16";

function required(name) {
  const value = process.env[name];
  if (!value) throw new Error(`Missing required environment variable: ${name}`);
  return value;
}

function baseUrl() {
  return process.env.SQUARE_ENVIRONMENT === "production"
    ? "https://connect.squareup.com"
    : "https://connect.squareupsandbox.com";
}

export async function squareRequest(path, options = {}) {
  const response = await fetch(`${baseUrl()}${path}`, {
    method: options.method || "GET",
    headers: {
      Authorization: `Bearer ${required("SQUARE_ACCESS_TOKEN")}`,
      "Square-Version": SQUARE_VERSION,
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
    body: options.body == null ? undefined : JSON.stringify(options.body),
  });

  const text = await response.text();
  const data = text ? JSON.parse(text) : {};

  if (!response.ok) {
    const detail =
      data?.errors?.map((e) => e.detail || e.code).filter(Boolean).join("; ") ||
      `Square API request failed (${response.status})`;
    const error = new Error(detail);
    error.statusCode = response.status;
    error.square = data;
    throw error;
  }

  return data;
}

export function squareLocationId() {
  return required("SQUARE_LOCATION_ID");
}
