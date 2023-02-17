import { ddbClient } from '../libs/dynamodbClient';
import {
  GetItemCommand,
  GetItemCommandInput,
  ScanCommand,
  ScanCommandInput,
  PutItemCommand,
  PutItemCommandInput,
  PutItemCommandOutput,
  UpdateItemCommand,
  UpdateItemCommandInput,
  UpdateItemCommandOutput,
  DeleteItemCommand,
  DeleteItemCommandInput,
  DeleteItemCommandOutput,
} from '@aws-sdk/client-dynamodb';
import { marshall, unmarshall } from '@aws-sdk/util-dynamodb';
import { APIGatewayEvent } from 'aws-lambda';
import { randomUUID } from 'crypto';
import { EplResults, ISQSEvent } from '../types/types';

//TODO: Write unit tests for these controllers
const getMatchById = async (matchId: string) => {
  const params: GetItemCommandInput = {
    TableName: process.env.DYNAMODB_DATA_TABLE_NAME,
    Key: marshall({ id: matchId }),
  };
  try {
    const { Item } = await ddbClient.send(new GetItemCommand(params));
    return Item
      ? {
          item: unmarshall(Item),
        }
      : { message: 'This match does not exist' };
  } catch (error) {
    console.error(error);
    throw error;
  }
};

const getMatches = async () => {
  const params: ScanCommandInput = {
    TableName: process.env.DYNAMODB_DATA_TABLE_NAME,
  };
  try {
    const { Items } = await ddbClient.send(new ScanCommand(params));
    return Items && Items?.length > 0
      ? {
          count: Items.length,
          items: Items.map((Item) => unmarshall(Item)),
        }
      : { message: 'No items found' };
  } catch (error) {
    console.error(error);
    throw error;
  }
};

const createMatch = async (
  event: APIGatewayEvent | ISQSEvent
): Promise<PutItemCommandOutput> => {
  let params: PutItemCommandInput;

  if ('body' in event) {
    const requestBody = JSON.parse(event.body!);
    // add validator
    params = {
      TableName: process.env.DYNAMODB_DATA_TABLE_NAME,
      Item: marshall({ ...requestBody, id: randomUUID() } || {}),
    };
  } else {
    const match = event.event.detail;
    params = {
      TableName: process.env.DYNAMODB_DATA_TABLE_NAME,
      Item: marshall({ ...match } || {}),
    };
  }
  try {
    const createResult = await ddbClient.send(new PutItemCommand(params));
    return createResult;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

const updateMatch = async (
  event: APIGatewayEvent
): Promise<UpdateItemCommandOutput> => {
  let matchId = '';
  if (event.pathParameters && event.pathParameters.id) {
    matchId = event.pathParameters.id;
  } else {
    throw new Error('Please provide the ID for this match');
  }
  const match = await getMatchById(matchId);
  if (Object.keys(match).length === 0) {
    throw new Error('This match does not exist!');
  }

  const requestBody = JSON.parse(event.body!);
  const objKeys = Object.keys(requestBody);

  const params: UpdateItemCommandInput = {
    TableName: process.env.DYNAMODB_DATA_TABLE_NAME,
    Key: marshall({ id: matchId }),
    UpdateExpression: `SET ${objKeys
      .map((_, index) => `#key${index} = :value${index}`)
      .join(', ')}`,
    ExpressionAttributeNames: objKeys.reduce(
      (acc, key, index) => ({
        ...acc,
        [`#key${index}`]: key,
      }),
      {}
    ),
    ExpressionAttributeValues: marshall(
      objKeys.reduce(
        (acc, key, index) => ({
          ...acc,
          [`:value${index}`]: requestBody[key],
        }),
        {}
      )
    ),
  };
  try {
    return await ddbClient.send(new UpdateItemCommand(params));
  } catch (error) {
    console.log(error);
    throw error;
  }
};

const deleteMatch = async (
  matchId: string
): Promise<DeleteItemCommandOutput> => {
  const match = await getMatchById(matchId);
  if (Object.keys(match).length === 0) {
    throw new Error('This match does not exist!');
  }

  const params: DeleteItemCommandInput = {
    TableName: process.env.DYNAMODB_DATA_TABLE_NAME,
    Key: marshall({ id: matchId }),
  };
  try {
    return await ddbClient.send(new DeleteItemCommand(params));
  } catch (error) {
    console.log(error);
    throw error;
  }
};

export { getMatchById, getMatches, createMatch, updateMatch, deleteMatch };
