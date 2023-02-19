// data handler
import {
  APIGatewayEvent,
  APIGatewayProxyResult,
  Context,
  SQSEvent,
  EventBridgeEvent,
} from 'aws-lambda';

import {
  createMatch,
  getMatches,
  getMatchById,
  updateMatch,
  deleteMatch,
} from './controllers/data-controllers';
import { EplResults } from './types/types';

exports.handler = async (
  event: APIGatewayEvent | EventBridgeEvent<any, EplResults> | SQSEvent,
  context: Context
): Promise<APIGatewayProxyResult> => {
  console.log(`Context: ${JSON.stringify(context, undefined, 2)}`);
  console.log(`Event: ${JSON.stringify(event, undefined, 2)}`);
  if ('detail-type' in event) {
    await eventBridgeInvocation(event);
    return {
      statusCode: 201,
      body: JSON.stringify({
        message: 'Match added!',
      }),
    };
  } else if ('Records' in event) {
    console.log('Invoking SQS Event . . .');
    await handleSqsEvent(event);
    return {
      statusCode: 201,
      body: JSON.stringify({
        message: 'Match added!',
      }),
    };
  } else {
    return await apiGatewayInvocation(event);
  }
};

// Can Receive data from queue
const handleSqsEvent = async (event: SQSEvent) => {
  console.log('SQS Event: ', event.Records);

  for (const record of event.Records) {
    const data = JSON.parse(record.body) as EplResults;
    await createMatch(data);
  }
};

// Can receive data from EventBridgeEvent
const eventBridgeInvocation = async (
  event: EventBridgeEvent<any, EplResults>
) => {
  console.log(`Event Bridge Invokation event:`, event);
  await createMatch(event.detail);
};

const apiGatewayInvocation = async (
  event: APIGatewayEvent
): Promise<APIGatewayProxyResult> => {
  let apiResponse: APIGatewayProxyResult = {
    statusCode: 404,
    body: JSON.stringify({
      message: `Invalid method / route`,
    }),
  };
  // add auth middleware
  try {
    switch (event.httpMethod) {
      case 'GET':
        if (event.pathParameters && event.pathParameters.id) {
          const match = await getMatchById(event.pathParameters.id);
          apiResponse = {
            statusCode: 200,
            body: JSON.stringify({
              match,
            }),
          };
        } else {
          const matches = await getMatches();
          apiResponse = {
            statusCode: 200,
            body: JSON.stringify({
              matches,
            }),
          };
        }
        break;
      case 'POST':
        const result = await createMatch(event);
        apiResponse = {
          statusCode: 201,
          body: JSON.stringify({
            message: 'Match Created',
            match: result.Attributes,
          }),
        };
        break;
      case 'PATCH':
        const updatedMatch = await updateMatch(event);
        apiResponse = {
          statusCode: 200,
          body: JSON.stringify({
            message: 'Match Updated',
            match: updatedMatch,
          }),
        };
        break;
      case 'DELETE':
        if (
          event.pathParameters !== null &&
          event.pathParameters.id !== undefined
        ) {
          await deleteMatch(event.pathParameters.id);
          apiResponse = {
            statusCode: 200,
            body: JSON.stringify({
              message: 'Match Deleted',
            }),
          };
        }
        break;
      default:
        throw new Error('Invalid method / route');
    }
    return apiResponse;
  } catch (error) {
    console.error(error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        message:
          error instanceof Error
            ? error.message
            : 'An error occured, try again.',
      }),
    };
  }
};
