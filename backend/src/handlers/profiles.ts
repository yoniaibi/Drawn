import { APIGatewayProxyHandlerV2 } from 'aws-lambda';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, GetCommand, PutCommand, UpdateCommand } from '@aws-sdk/lib-dynamodb';

const client = DynamoDBDocumentClient.from(new DynamoDBClient({}));
const TABLE = process.env.PROFILES_TABLE!;

function ok(body: unknown) {
  return { statusCode: 200, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) };
}
function err(msg: string, status = 400) {
  return { statusCode: status, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ error: msg }) };
}

export const get: APIGatewayProxyHandlerV2 = async (event) => {
  const userId = event.pathParameters?.userId;
  const claims = (event.requestContext as any).authorizer?.jwt?.claims;
  if (claims?.sub !== userId) return err('Forbidden', 403);

  const result = await client.send(new GetCommand({ TableName: TABLE, Key: { id: userId } }));
  if (!result.Item) {
    // Auto-create profile on first access
    const profile = {
      id: userId,
      handle: null,
      avatar_letter: 'Y',
      wallet_balance: 0,
      is_seller: false,
      notify_before_close: true,
      createdAt: new Date().toISOString(),
    };
    await client.send(new PutCommand({ TableName: TABLE, Item: profile }));
    return ok(profile);
  }
  return ok(result.Item);
};

export const update: APIGatewayProxyHandlerV2 = async (event) => {
  const userId = event.pathParameters?.userId;
  const claims = (event.requestContext as any).authorizer?.jwt?.claims;
  if (claims?.sub !== userId) return err('Forbidden', 403);

  const body = JSON.parse(event.body ?? '{}');
  const updates = Object.entries(body);
  if (updates.length === 0) return err('No fields to update');

  const expr = updates.map(([k], i) => `#k${i} = :v${i}`).join(', ');
  const names = Object.fromEntries(updates.map(([k], i) => [`#k${i}`, k]));
  const values = Object.fromEntries(updates.map(([k, v], i) => [`:v${i}`, v]));

  await client.send(new UpdateCommand({
    TableName: TABLE,
    Key: { id: userId },
    UpdateExpression: `SET ${expr}`,
    ExpressionAttributeNames: names,
    ExpressionAttributeValues: values,
  }));
  return ok({ updated: true });
};
