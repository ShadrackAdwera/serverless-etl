import { APIGatewayEvent, APIGatewayProxyResult, Context } from 'aws-lambda';
import { randomUUID } from 'crypto';
import { CognitoJwtVerifier } from 'aws-jwt-verify';

import {
  fetchDataFromDynamoDb,
  fetchPresignedUrlAndUploadToS3,
  sendFileUrlToDynamoDB,
} from './controllers/file-upload-controllers';
import { CognitoIdTokenPayload } from 'aws-jwt-verify/jwt-model';

const bucket = process.env.S3_BUCKET;

exports.handler = async (
  event: APIGatewayEvent,
  context: Context
): Promise<APIGatewayProxyResult> => {
  console.log(`Event \n ${JSON.stringify(event, undefined, 2)}`);
  console.log(`Context \n ${JSON.stringify(context, undefined, 2)}`);
  if (!bucket) {
    return {
      body: JSON.stringify({ message: 'Configure the S3 BUCKET' }),
      statusCode: 404,
    };
  }

  if (!process.env.USERPOOL_ID) {
    return {
      body: JSON.stringify({ message: 'Invalid User Pool ID configuration' }),
      statusCode: 403,
    };
  }

  if (!process.env.USERPOOL_CLIENT_ID) {
    return {
      body: JSON.stringify({
        message: 'Invalid User Pool Client ID configuration',
      }),
      statusCode: 403,
    };
  }

  const jwt = event.headers['Authorization'];

  if (!jwt) {
    return {
      body: JSON.stringify({ message: 'Cannot retreive JWT' }),
      statusCode: 400,
    };
  }

  const payload = await decodeCogitoPayload(jwt);

  if (event.httpMethod === 'GET') {
    const data = await fetchDataFromDynamoDb(payload['cognito:username']);
    return {
      body: JSON.stringify({
        message: `GET Method ${randomUUID()}`,
      }),
      statusCode: 200,
    };
  }

  if (event.httpMethod === 'PUT') {
    try {
      if (!event.headers['Content-Type']) {
        return {
          body: JSON.stringify({
            message: 'provide the content-type as multipart/form-data',
          }),
          statusCode: 400,
        };
      }
      if (!event.body) {
        return {
          body: JSON.stringify({ message: 'provide the file' }),
          statusCode: 400,
        };
      }
      const data = Buffer.from(event.body, 'utf-8');
      console.log(`Read File: ${data}`);
      const key = `${payload['cognito:username']}/${randomUUID()}.csv`;

      if (!data) {
        return {
          body: JSON.stringify({ message: 'cannot read file contents' }),
          statusCode: 400,
        };
      }
      await fetchPresignedUrlAndUploadToS3({
        Bucket: bucket,
        Body: data,
        Key: key,
      });
      await sendFileUrlToDynamoDB({
        fileUrl: key,
        userId: payload['cognito:username'],
      });
      return {
        body: JSON.stringify({
          message: 'File uploaded successfully to your S3 bucket',
        }),
        statusCode: 201,
      };
    } catch (err) {
      return {
        body: JSON.stringify({ message: err }),
        statusCode: 400,
      };
    }
  }
  return {
    body: JSON.stringify({ message: 'Invalid method ...' }),
    statusCode: 404,
  };
};

const decodeCogitoPayload = async (
  jwt: string
): Promise<CognitoIdTokenPayload> => {
  try {
    const verifier = CognitoJwtVerifier.create({
      userPoolId: process.env.USERPOOL_ID!,
      tokenUse: 'id',
      clientId: process.env.USERPOOL_CLIENT_ID!,
    });

    const payload = await verifier.verify(jwt);
    return payload;
  } catch (error) {
    throw error;
  }
};
