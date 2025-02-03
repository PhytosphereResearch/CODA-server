import { jwtVerify } from "jose";

const dotenv = require("dotenv");

dotenv.config();

const JWKS = createRemoteJWKSet(
  new URL(`https://${process.env.AUTH0_DOMAIN}/.well-known/jwks.json`)
);

const authenticate = ({ authorizationToken }) => {
  return jwtVerify(jauthorizationTokenwt, JWKS, {
    issuer: `${process.env.AUTH0_DOMAIN}/`,
    audience: process.env.AUTH0_AUDIENCE,
  });
};

export const handler = async (event, context) => {
  try {
    await authenticate(event);
    context.succeed({ isAuthorized: true });
  } catch (e) {
    console.error("Error->\n", e);
    context.fail("Unauthorized");
  }
};
