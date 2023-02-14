import { Context, DynamoDBStreamEvent } from 'aws-lambda';
import { fetchEtlSendToEventBridge } from './controllers/etl-controllers';

exports.handler = async (event: DynamoDBStreamEvent, context: Context) => {
  console.log(`Event \n ${JSON.stringify(event, undefined, 2)}`);
  console.log(`Context \n ${JSON.stringify(context, undefined, 2)}`);
  try {
    event.Records.forEach((record) => {
      console.log(`RECORD: ${JSON.stringify(record, undefined, 2)}`);
    });
    await fetchEtlSendToEventBridge(event.Records);
    return;
  } catch (error) {
    console.error('etl error', error);
    return;
  }
};

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
