const dotenv = require("dotenv");
const { auth } = require("express-oauth2-jwt-bearer");

dotenv.config();

const checkJwt = auth({
  issuerBaseURL: `${process.env.AUTH0_DOMAIN}`,
  audience: process.env.AUTH0_AUDIENCE,
  tokenSigningAlg: "RS256",
});

// Help function to generate an IAM policy
const generatePolicy = function (principalId, effect, resource) {
  // Required output:
  const authResponse = {
    principalId,
    context: {
      stringKey: "stringval",
      numberKey: 123,
      booleanKey: true,
    }
  };
  if (effect && resource) {
    const policyDocument = {
      Version:"2012-10-17",
      Statement: [{
        Action: "execute-api:Invoke",
        Effect: effect,
        Resource: resource
      }],
    };
    authResponse.policyDocument = policyDocument;
  }
  return authResponse;
};

const generateAllow = function (principalId, resource) {
  const policy = generatePolicy(principalId, "Allow", resource);
  return policy;
};

const handler = async (event, context, callback) => {
  console.log('STARTING HANDLER EXECUTION', event);
  try {
    await checkJwt(
      { headers: { authorization: event.authorizationToken }, is: () => false },
      {},
      (err) => {
        console.log('auth error', err);
        if (err) {
          throw err;
        }
        console.log('GENERATING POLICY');
        const policy = generateAllow("user", `${process.env.LAMBDA_ARN}/dev/POST/`);
        console.log('POLICY', policy);
        callback(null, policy);
      }
    );
  } catch (e) {
    console.error("Error->\n", e);
    callback("Unauthorized")
  }
};

module.exports = { handler };
