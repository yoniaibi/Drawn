import { Amplify } from 'aws-amplify';

const amplifyConfig = {
  Auth: {
    Cognito: {
      userPoolId: process.env.EXPO_PUBLIC_AWS_USER_POOL_ID ?? 'YOUR_USER_POOL_ID',
      userPoolClientId: process.env.EXPO_PUBLIC_AWS_USER_POOL_CLIENT_ID ?? 'YOUR_CLIENT_ID',
      signUpVerificationMethod: 'code' as const,
      loginWith: { email: true },
    },
  },
};

Amplify.configure(amplifyConfig);

export { Amplify };
export const API_URL = process.env.EXPO_PUBLIC_API_URL ?? '';
