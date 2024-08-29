import { Amplify } from "aws-amplify";

Amplify.configure({
  Auth: {
    region: "eu-north-1",
    userPoolId: "YOUR_USER_POOL_ID",
    userPoolWebClientId: "YOUR_USER_POOL_WEB_CLIENT_ID",
  },
  API: {
    endpoints: [
      {
        name: "bitpredictApi",
        endpoint: "YOUR_API_GATEWAY_ENDPOINT",
        region: "YOUR_REGION",
      },
    ],
  },
});
