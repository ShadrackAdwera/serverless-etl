import { ITable } from 'aws-cdk-lib/aws-dynamodb';
import { Runtime } from 'aws-cdk-lib/aws-lambda';
import {
  NodejsFunction,
  NodejsFunctionProps,
} from 'aws-cdk-lib/aws-lambda-nodejs';
import { Construct } from 'constructs';
import * as path from 'path';

interface ILambdaConstruct {
  dataTable: ITable;
  userPoolId: string;
  userPoolClientId: string;
}

const getFnProps = (): NodejsFunctionProps => {
  const nodeJsFnProps: NodejsFunctionProps = {
    bundling: {
      externalModules: ['aws-sdk'],
      minify: true,
    },
    runtime: Runtime['NODEJS_16_X'],
  };
  return nodeJsFnProps;
};

export class SQSToDynamoFnLambdaConstruct extends Construct {
  public readonly dataLambdaFn: NodejsFunction;
  constructor(scope: Construct, id: string, props: ILambdaConstruct) {
    super(scope, id);
    this.dataLambdaFn = this.createLambda(props);
  }

  private createLambda(props: ILambdaConstruct): NodejsFunction {
    const lambdFn = new NodejsFunction(this, 'file-upload-lambdafn', {
      entry: path.join(__dirname, '/../../src/data/index.ts'),
      environment: {
        DYNAMODB_DATA_TABLE_NAME: props.dataTable.tableName,
        USERPOOL_ID: props.userPoolId,
        USERPOOL_CLIENT_ID: props.userPoolClientId,
      },
      ...getFnProps(),
    });
    props.dataTable.grantReadWriteData(lambdFn);
    return lambdFn;
  }
}
