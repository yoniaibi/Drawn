import { APIGatewayProxyHandlerV2 } from 'aws-lambda';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, QueryCommand, PutCommand, UpdateCommand } from '@aws-sdk/lib-dynamodb';
import { v4 as uuid } from 'uuid';

const client = DynamoDBDocumentClient.from(new DynamoDBClient({}));
const WALLET = process.env.WALLET_TABLE!;
const PROFILES = process.env.PROFILES_TABLE!;

function ok(body: unknown) {
  return { statusCode: 200, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) };
}
function err(msg: string, status = 400) {
  return { statusCode: status, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ error: msg }) };
}

export const transactions: APIGatewayProxyHandlerV2 = async (event) => {
  const claims = (event.requestContext as any).authorizer?.jwt?.claims;
  const userId = claims?.sub;
  if (!userId) return err('Unauthorised', 401);

  const result = await client.send(new QueryCommand({
    TableName: WALLET,
    IndexName: 'userId-index',
    KeyConditionExpression: 'userId = :uid',
    ExpressionAttributeValues: { ':uid': userId },
    ScanIndexForward: false,
    Limit: 20,
  }));
  return ok(result.Items ?? []);
};

export const addFunds: APIGatewayProxyHandlerV2 = async (event) => {
  const claims = (event.requestContext as any).authorizer?.jwt?.claims;
  const userId = claims?.sub;
  if (!userId) return err('Unauthorised', 401);

  const { amount, description } = JSON.parse(event.body ?? '{}');
  if (!amount || amount <= 0) return err('Invalid amount');

  const tx = {
    id: uuid(),
    userId,
    type: 'top_up',
    description: description ?? 'Wallet top-up',
    amount: Number(amount),
    createdAt: new Date().toISOString(),
  };

  await client.send(new PutCommand({ TableName: WALLET, Item: tx }));

  // Update profile wallet balance
  await client.send(new UpdateCommand({
    TableName: PROFILES,
    Key: { id: userId },
    UpdateExpression: 'SET wallet_balance = if_not_exists(wallet_balance, :zero) + :amount',
    ExpressionAttributeValues: { ':amount': Number(amount), ':zero': 0 },
  }));

  return ok(tx);
};
