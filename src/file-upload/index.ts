import { APIGatewayEvent, APIGatewayProxyResult, Context } from 'aws-lambda';
import { randomUUID } from 'crypto';

import { fetchPresignedUrlAndUploadToS3 } from './controllers/file-upload-controllers';

// const bucket = process.env.S3_BUCKET;

exports.handler = async (
  event: APIGatewayEvent,
  context: Context
): Promise<APIGatewayProxyResult> => {
  console.log(`Event \n ${JSON.stringify(event, undefined, 2)}`);
  console.log(`Context \n ${JSON.stringify(context, undefined, 2)}`);
  // if (!bucket) {
  //   return {
  //     body: JSON.stringify({ message: 'Configure the S3 BUCKET' }),
  //     statusCode: 404,
  //   };
  // }

  if (event.httpMethod === 'GET') {
    return {
      body: JSON.stringify({
        message: `GET Method ${randomUUID()}`,
        encodedCSVFile: process.env.USERPOOL_ID,
        decodedCSVFile: process.env.USERPOOL_CLIENT_ID,
      }),
      statusCode: 200,
    };
  }

  if (event.httpMethod === 'PUT') {
    if (!event.body) {
      return {
        body: JSON.stringify({ message: 'Invalid body' }),
        statusCode: 400,
      };
    }

    let encodedCSVFile = JSON.parse(event.body).file;
    if (!encodedCSVFile) {
      return {
        body: JSON.stringify({ message: 'Provide a file' }),
        statusCode: 400,
      };
    }
    let decodedCSVFile = Buffer.from(encodedCSVFile, 'utf-8');
    return {
      body: JSON.stringify({
        message: `PUT Method`,
        encodedCSVFile,
        decodedCSVFile,
      }),
      statusCode: 200,
    };
  }

  // if (event.httpMethod === 'PUT') {
  //   try {
  //     const res = await fetchPresignedUrlAndUploadToS3({
  //       Bucket: bucket,
  //       Body: '',
  //       Key: randomUUID(),
  //     });
  //     return {
  //       body: JSON.stringify({
  //         message: 'File uplaoded successfully to your S3 bucket',
  //         data: res,
  //       }),
  //       statusCode: 201,
  //     };
  //   } catch (err) {
  //     return {
  //       body: JSON.stringify({ message: err }),
  //       statusCode: 400,
  //     };
  //   }
  // } else {
  //   return {
  //     body: JSON.stringify({ message: 'Invalid method ...' }),
  //     statusCode: 404,
  //   };
  // }
  return {
    body: JSON.stringify({ message: 'Invalid method ...' }),
    statusCode: 404,
  };
};
