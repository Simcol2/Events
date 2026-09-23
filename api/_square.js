import pkg from "square";

const { SquareClient, SquareEnvironment } = pkg;

function required(name) {
  const value = process.env[name];
  if (!value) throw new Error(`Missing required environment variable: ${name}`);
  return value;
}

export function getSquareClient() {
  const environment =
    process.env.SQUARE_ENVIRONMENT === "production"
      ? SquareEnvironment.Production
      : SquareEnvironment.Sandbox;

  return new SquareClient({
    token: required("SQUARE_ACCESS_TOKEN"),
    environment,
  });
}

export function getSquareLocationId() {
  return required("SQUARE_LOCATION_ID");
}

export function squareEnvironmentName() {
  return process.env.SQUARE_ENVIRONMENT === "production" ? "production" : "sandbox";
}
