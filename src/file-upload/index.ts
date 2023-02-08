import { APIGatewayEvent, APIGatewayProxyResult, Context } from 'aws-lambda';
import { randomUUID } from 'crypto';
import { createReadStream } from 'fs';
import { fetchPresignedUrlAndUploadToS3 } from './controllers/file-upload-controllers';

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

  if (event.httpMethod === 'GET') {
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

      if (!data) {
        return {
          body: JSON.stringify({ message: 'cannot read file contents' }),
          statusCode: 400,
        };
      }
      const res = await fetchPresignedUrlAndUploadToS3({
        Bucket: bucket,
        Body: data,
        Key: `${randomUUID()}.csv`,
      });
      return {
        body: JSON.stringify({
          message: 'File uplaoded successfully to your S3 bucket',
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
