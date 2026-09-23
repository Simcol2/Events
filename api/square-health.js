import { getSquareClient, getSquareLocationId, squareEnvironmentName } from "./_square.js";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const square = getSquareClient();
    const locationId = getSquareLocationId();
    const response = await square.locations.get({ locationId });

    return res.status(200).json({
      ok: true,
      environment: squareEnvironmentName(),
      locationId,
      locationName: response.location?.name || null,
    });
  } catch (error) {
    console.error("Square health check failed:", error);
    return res.status(500).json({
      ok: false,
      error: error?.message || "Square connection failed",
    });
  }
}
