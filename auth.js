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
  const policy = generatePolicy(principalId, "Allow", resource);
  return policy;
};

const handler = async (event, context) => {
  console.log('STARTING HANDLER EXECUTION');
  try {
    return checkJwt(
      { headers: { authorization: event.authorizationToken }, is: () => false }).then(()=> {
        const policy = generateAllow("user", `${process.env.LAMBDA_ARN}/dev/POST/`);
        console.log('POLICY', policy);
        return context.succeed(policy)
      }).catch(err => {
          console.log('auth error', err);
          throw err;
      })
  } catch (e) {
    console.error("Error->\n", e);
    context.fail("Unauthorized")
  }
};

module.exports = { handler };
