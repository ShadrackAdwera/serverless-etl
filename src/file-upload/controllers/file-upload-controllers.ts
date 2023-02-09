import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { PutObjectCommand } from '@aws-sdk/client-s3';
import { PutItemCommand, PutItemCommandInput } from '@aws-sdk/client-dynamodb';
import { marshall } from '@aws-sdk/util-dynamodb';
import axios from 'axios';

import { s3Client } from '../libs/s3Client';
import { ddbClient } from '../libs/dynamodbClient';
import { randomUUID } from 'crypto';

// export const bucketParams = {
//   Bucket: `test-bucket-${Math.ceil(Math.random() * 10 ** 10)}`,
//   Key: `test-object-${Math.ceil(Math.random() * 10 ** 10)}`,
//   Body: 'BODY',
// };
interface IDynamodbPost {
  userId: string;
  fileUrl: string;
}

const fetchPresignedUrlAndUploadToS3 = async (bucketParams: {
  Bucket: string;
  Key: string;
  Body: any;
}) => {
  try {
    const command = new PutObjectCommand(bucketParams);
    const signedUrl = await getSignedUrl(s3Client, command, {
      expiresIn: 3600,
    });
    console.log(
      `\nPutting "${bucketParams.Key}" using signedUrl with body "${bucketParams.Body}" in s3`
    );
    const resp = await axios.put(signedUrl, bucketParams.Body);
    return resp.data;
  } catch (error) {
    console.log(error);
    throw error;
  }
};

const sendFileUrlToDynamoDB = async ({ fileUrl, userId }: IDynamodbPost) => {
  const params: PutItemCommandInput = {
    TableName: process.env.DYNAMODB_TABLE_NAME,
    Item: marshall(
      {
        id: randomUUID(),
        userId,
        fileUrl,
        createdAt: new Date().toISOString(),
      } || {}
    ),
  };
  try {
    const createResult = await ddbClient.send(new PutItemCommand(params));
    return createResult;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export { fetchPresignedUrlAndUploadToS3, sendFileUrlToDynamoDB };
