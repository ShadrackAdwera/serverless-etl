import { Context, DynamoDBStreamEvent } from 'aws-lambda';

exports.handler = async (event: DynamoDBStreamEvent, context: Context) => {
  console.log(`Event \n ${JSON.stringify(event, undefined, 2)}`);
  console.log(`Context \n ${JSON.stringify(context, undefined, 2)}`);
  try {
    event.Records.forEach((record) => {
      console.log(`RECORD: ${JSON.stringify(record, undefined, 2)}`);
    });
    return;
  } catch (error) {
    console.error('etl error', error);
    return;
  }
};
