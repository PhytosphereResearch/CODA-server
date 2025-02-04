const { jwtVerify, createRemoteJWKSet, jwtDecrypt } = require("jose");

const dotenv = require("dotenv");

dotenv.config();

const JWKS = createRemoteJWKSet(
  new URL(`https://${process.env.AUTH0_DOMAIN}/.well-known/jwks.json`)
);

const authenticate = ({ authorizationToken }) => {
  return jwtVerify(authorizationToken, JWKS, {
    issuer: `${process.env.AUTH0_DOMAIN}/`,
    audience: process.env.AUTH0_AUDIENCE,
  });
};

// Help function to generate an IAM policy
const generatePolicy = function (principalId, effect, resource) {
  // Required output:
  const authResponse = {};
  authResponse.principalId = principalId;
  if (effect && resource) {
    const policyDocument = {};
    policyDocument.Version = "2012-10-17"; // default version
    policyDocument.Statement = [];
    const statementOne = {};
    statementOne.Action = "execute-api:Invoke"; // default action
    statementOne.Effect = effect;
    statementOne.Resource = resource;
    policyDocument.Statement[0] = statementOne;
    authResponse.policyDocument = policyDocument;
  }
  // Optional output with custom properties of the String, Number or Boolean type.
  authResponse.context = {
    stringKey: "stringval",
    numberKey: 123,
    booleanKey: true,
  };
  return authResponse;
};

const generateAllow = function (principalId, resource) {
  return generatePolicy(principalId, "Allow", resource);
};

const handler = async (event, context) => {
  try {
    await authenticate(event);
    const { sub } = decodeJwt({ authorizationToken });
    context.succeed(generateAllow(sub, `${process.env.LAMBDA_ARN}/dev/POST/`));
  } catch (e) {
    console.error("Error->\n", e);
    context.fail("Unauthorized");
  }
};

module.exports = { handler };
