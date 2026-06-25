# Drawn — AWS Backend Setup

Architecture: **AWS Cognito** (auth) + **API Gateway HTTP API** + **Lambda** (Node 20) + **DynamoDB** (on-demand) — fully serverless, no servers to host.

---

## Prerequisites

1. An AWS account — sign up free at aws.amazon.com  
2. AWS CLI installed and configured (`aws configure`)  
3. Node.js 20+

---

## Step 1 — Create a Cognito User Pool

In the AWS Console:

1. Go to **Cognito → User pools → Create user pool**
2. **Sign-in options:** Email  
3. **Password policy:** choose your defaults  
4. **MFA:** optional (recommended: optional SMS/TOTP)  
5. **Email delivery:** use Cognito's default sender (free up to 50/day) or configure SES  
6. **App client:** create a **Public client** (no secret), name it `drawn-app`  
   - Enabled auth flows: **USER_SRP_AUTH** + **REFRESH_TOKEN_AUTH**  
   - No client secret  
7. **Hosted UI / domain:** optional — the app uses SDK auth flows, not the hosted UI  

After creating, note down:
- **User Pool ID** (looks like `eu-west-2_XXXXXXXXX`)
- **App client ID** (long alphanumeric string)

---

## Step 2 — Deploy the backend

```bash
cd backend
npm install

# Set env vars (or add to .env, then source it)
export USER_POOL_ID=eu-west-2_XXXXXXXXX
export USER_POOL_CLIENT_ID=XXXXXXXXXXXXXXXXXXXXXXXXXX

# Deploy to dev stage (first deploy takes ~3 minutes)
npx serverless deploy --stage dev
```

At the end of the output you'll see:
```
endpoints:
  GET  - https://XXXXXXXX.execute-api.eu-west-2.amazonaws.com/draws
  POST - https://XXXXXXXX.execute-api.eu-west-2.amazonaws.com/draws
  ...
```

Copy the base URL (everything before `/draws`).

---

## Step 3 — Configure the app

Copy `.env.example` to `.env` and fill in the three values:

```
EXPO_PUBLIC_AWS_USER_POOL_ID=eu-west-2_XXXXXXXXX
EXPO_PUBLIC_AWS_USER_POOL_CLIENT_ID=XXXXXXXXXXXXXXXXXXXXXXXXXX
EXPO_PUBLIC_API_URL=https://XXXXXXXX.execute-api.eu-west-2.amazonaws.com
```

Then restart the Expo dev server:
```bash
npx expo start --clear
```

---

## Step 4 — Test it

1. Open the app and sign up with an email address  
2. Check your email for the confirmation code  
3. Enter the code in the app (if sign-up confirmation is required — see Cognito settings)  
4. You should land on the home feed  

---

## Deploying to production

```bash
export USER_POOL_ID=eu-west-2_XXXXXXXXX
export USER_POOL_CLIENT_ID=XXXXXXXXXXXXXXXXXXXXXXXXXX
npx serverless deploy --stage prod
```

Use separate User Pools for dev and prod.

---

## Costs (rough estimate, all on AWS free tier initially)

| Service | Free tier | Pay-as-you-go |
|---------|-----------|---------------|
| Cognito | 50,000 MAU free | $0.0055/MAU after |
| Lambda | 1M requests/month free | $0.20/1M after |
| DynamoDB | 25 GB + 25 WCU/RCU free | $1.25/M writes after |
| API Gateway | 1M calls/month free | $1/M after |

At typical early-stage scale this costs **£0/month**.

---

## Removing the backend

```bash
cd backend
npx serverless remove --stage dev
```

This deletes all Lambda functions and API Gateway. **DynamoDB tables are NOT deleted** to protect data — delete them manually in the console if needed.
