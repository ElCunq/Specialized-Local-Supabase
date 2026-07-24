import crypto from "crypto";
import jwt from "jsonwebtoken";

/**
 * Generates a random high-entropy secret key for JWT signing or DB password.
 */
export function generateRandomSecret(length = 32): string {
  return crypto.randomBytes(length).toString("hex");
}

/**
 * Generates PostgREST compatible JWT Tokens (anon and service_role).
 */
export function generateProjectJwtTokens(jwtSecret: string, slug: string) {
  const anonPayload = {
    role: "anon",
    iss: "db-orfa-dev",
    tenant: slug,
    iat: Math.floor(Date.now() / 1000),
  };

  const servicePayload = {
    role: "service_role",
    iss: "db-orfa-dev",
    tenant: slug,
    iat: Math.floor(Date.now() / 1000),
  };

  const anonKey = jwt.sign(anonPayload, jwtSecret);
  const serviceKey = jwt.sign(servicePayload, jwtSecret);

  return { anonKey, serviceKey };
}
