import { DynamoDBRecord } from 'aws-lambda';
import { GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import axios from 'axios';

import { s3Client } from './../libs/s3Client';
import { CsvFileReader } from '../utils/CsvReader';

/*
{
    "Records": [
        {
            "eventID": "**",
            "eventName": "INSERT",
            "eventVersion": "1.1",
            "eventSource": "aws:dynamodb",
            "awsRegion": "us-east-1",
            "dynamodb": {
                "ApproximateCreationDateTime": 1676007513,
                "Keys": {
                    "id": {
                        "S": "7f853885-dda6-4e48-b970-dba1ecac0258"
                    }
                },
                "NewImage": {
                    "createdAt": {
                        "S": "2023-02-10T05:38:32.757Z"
                    },
                    "fileUrl": {
                        "S": "b6353c46-457c-45e6-ac53-52e169cd2ae2/09367079-dc4d-4f97-9bdf-05dea69d8112.csv"
                    },
                    "id": {
                        "S": "7f853885-dda6-4e48-b970-dba1ecac0258"
                    },
                    "userId": {
                        "S": "b6353c46-457c-45e6-ac53-52e169cd2ae2"
                    }
                },
                "SequenceNumber": "100000000012912323457",
                "SizeBytes": 235,
                "StreamViewType": "NEW_AND_OLD_IMAGES"
            },
            "eventSourceARN": "**"
        }
    ]
}
*/

const fetchEtlSendToEventBridge = async (records: DynamoDBRecord[]) => {
  if (!process.env.S3_BUCKET_NAME) {
    throw new Error('Provide the S3_BUCKET_NAME');
  }
  try {
    for (const record of records) {
      if (record.dynamodb && record.dynamodb.NewImage) {
        const bucketParams = {
          Bucket: process.env.S3_BUCKET_NAME,
          Key: record.dynamodb.NewImage.fileUrl['S'],
        };
        const command = new GetObjectCommand(bucketParams);
        // Create the presigned URL.
        const signedUrl = await getSignedUrl(s3Client, command, {
          expiresIn: 900,
        });
        console.log(
          `\nGetting "${bucketParams.Key}" using signedUrl from bucket"${bucketParams.Bucket}" in s3`
        );
        console.log(signedUrl);
        const resp = await axios.get(signedUrl);
        console.log(`\nResponse returned by signed URL: ${await resp.data}\n`);
        const buffer = Buffer.from(resp.data, 'utf-8');

        // extract data from document body
        const csvReader = new CsvFileReader(buffer.toString('utf-8'));
        const eplData = csvReader
          .read()
          .filter((r) => r.homeTeam !== undefined && r.homeScored !== null);
        for (const eplDt of eplData) {
          const {
            awayScored,
            awayTeam,
            homeScored,
            homeTeam,
            matchDay,
            ref,
            winner,
          } = eplDt;
          // send to EventBridge
        }
        //return resp.data;
      }
    }
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export { fetchEtlSendToEventBridge };
