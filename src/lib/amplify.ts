import { Amplify } from 'aws-amplify';
import { cognitoUserPoolsTokenProvider } from 'aws-amplify/auth/cognito';
import * as SecureStore from 'expo-secure-store';

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

cognitoUserPoolsTokenProvider.setKeyValueStorage({
  getItem: (key: string) => SecureStore.getItemAsync(key),
  setItem: (key: string, value: string) => SecureStore.setItemAsync(key, value),
  removeItem: (key: string) => SecureStore.deleteItemAsync(key),
  clear: async () => { /* no-op — individual keys are cleared on sign-out */ },
});

export { Amplify };
export const API_URL = process.env.EXPO_PUBLIC_API_URL ?? '';
