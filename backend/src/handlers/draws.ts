import { APIGatewayProxyHandlerV2 } from 'aws-lambda';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, ScanCommand, GetCommand, QueryCommand, PutCommand } from '@aws-sdk/lib-dynamodb';
import { v4 as uuid } from 'uuid';

const client = DynamoDBDocumentClient.from(new DynamoDBClient({}));
const TABLE = process.env.DRAWS_TABLE!;

function ok(body: unknown, status = 200) {
  return { statusCode: status, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) };
}
function err(msg: string, status = 400) {
  return { statusCode: status, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ error: msg }) };
}

export const list: APIGatewayProxyHandlerV2 = async () => {
  const result = await client.send(new ScanCommand({ TableName: TABLE, Limit: 100 }));
  const draws = (result.Items ?? []).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  return ok(draws);
};

export const getById: APIGatewayProxyHandlerV2 = async (event) => {
  const id = event.pathParameters?.id;
  if (!id) return err('Missing id');
  const result = await client.send(new GetCommand({ TableName: TABLE, Key: { id } }));
  if (!result.Item) return err('Not found', 404);
  return ok(result.Item);
};

export const listByCategory: APIGatewayProxyHandlerV2 = async (event) => {
  const category = event.pathParameters?.category;
  if (!category) return err('Missing category');
  const result = await client.send(new QueryCommand({
    TableName: TABLE,
    IndexName: 'category-index',
    KeyConditionExpression: 'category = :cat',
    ExpressionAttributeValues: { ':cat': category },
    ScanIndexForward: false,
    Limit: 50,
  }));
  return ok(result.Items ?? []);
};

export const create: APIGatewayProxyHandlerV2 = async (event) => {
  const body = JSON.parse(event.body ?? '{}');
  const claims = (event.requestContext as any).authorizer?.jwt?.claims;
  const sellerId = claims?.sub;
  if (!sellerId) return err('Unauthorised', 401);

  const draw = {
    id: uuid(),
    createdAt: new Date().toISOString(),
    sellerId,
    status: 'pending',
    ticketsSold: 0,
    ...body,
  };
  await client.send(new PutCommand({ TableName: TABLE, Item: draw }));
  return ok(draw, 201);
};

export const recentWinners: APIGatewayProxyHandlerV2 = async () => {
  const result = await client.send(new QueryCommand({
    TableName: TABLE,
    IndexName: 'status-index',
    KeyConditionExpression: '#s = :completed',
    ExpressionAttributeNames: { '#s': 'status' },
    ExpressionAttributeValues: { ':completed': 'completed' },
    FilterExpression: 'attribute_exists(winnerHandle)',
    ScanIndexForward: false,
    Limit: 6,
  }));
  return ok(result.Items ?? []);
};
