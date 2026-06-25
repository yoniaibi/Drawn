import { APIGatewayProxyHandlerV2 } from 'aws-lambda';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, QueryCommand, PutCommand, UpdateCommand } from '@aws-sdk/lib-dynamodb';
import { v4 as uuid } from 'uuid';

const client = DynamoDBDocumentClient.from(new DynamoDBClient({}));
const TICKETS = process.env.TICKETS_TABLE!;
const WALLET = process.env.WALLET_TABLE!;
const DRAWS = process.env.DRAWS_TABLE!;
const PROFILES = process.env.PROFILES_TABLE!;

function ok(body: unknown, status = 200) {
  return { statusCode: status, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) };
}
function err(msg: string, status = 400) {
  return { statusCode: status, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ error: msg }) };
}

export const list: APIGatewayProxyHandlerV2 = async (event) => {
  const claims = (event.requestContext as any).authorizer?.jwt?.claims;
  const userId = claims?.sub;
  if (!userId) return err('Unauthorised', 401);

  const result = await client.send(new QueryCommand({
    TableName: TICKETS,
    IndexName: 'userId-index',
    KeyConditionExpression: 'userId = :uid',
    ExpressionAttributeValues: { ':uid': userId },
  }));
  return ok(result.Items ?? []);
};

export const purchase: APIGatewayProxyHandlerV2 = async (event) => {
  const claims = (event.requestContext as any).authorizer?.jwt?.claims;
  const userId = claims?.sub;
  if (!userId) return err('Unauthorised', 401);

  const { drawId, quantity } = JSON.parse(event.body ?? '{}');
  if (!drawId || !quantity) return err('Missing drawId or quantity');

  const ticket = {
    id: uuid(),
    userId,
    drawId,
    quantity: Number(quantity),
    purchasedAt: new Date().toISOString(),
  };
  await client.send(new PutCommand({ TableName: TICKETS, Item: ticket }));

  // Record wallet debit transaction (draw ticket price * quantity)
  await client.send(new PutCommand({
    TableName: WALLET,
    Item: {
      id: uuid(),
      userId,
      type: 'ticket_purchase',
      description: `Tickets for draw ${drawId}`,
      amount: -(quantity),
      createdAt: new Date().toISOString(),
    },
  }));

  return ok(ticket, 201);
};
