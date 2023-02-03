import { APIGatewayEvent, APIGatewayProxyResult, Context } from 'aws-lambda';

exports.handler = async (
  event: APIGatewayEvent,
  context: Context
): Promise<APIGatewayProxyResult> => {
  console.log(`Event \n ${JSON.stringify(event, null, 2)}`);
  console.log(`Context \n ${JSON.stringify(context, null, 2)}`);
  return {
    body: JSON.stringify({ message: 'Successful lambda invocation' }),
    statusCode: 200,
  };
};
