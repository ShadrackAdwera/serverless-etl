import { ITable } from 'aws-cdk-lib/aws-dynamodb';
import { Runtime } from 'aws-cdk-lib/aws-lambda';
import {
  NodejsFunction,
  NodejsFunctionProps,
} from 'aws-cdk-lib/aws-lambda-nodejs';
import { Construct } from 'constructs';
import * as path from 'path';

interface ILambdaConstruct {
  fileUploadTable: ITable;
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

export class LambdaConstruct extends Construct {
  public readonly fileUploadFn: NodejsFunction;
  constructor(scope: Construct, id: string, props: ILambdaConstruct) {
    super(scope, id);
    this.fileUploadFn = this.createLambda(props);
  }

  private createLambda(props: ILambdaConstruct): NodejsFunction {
    const lambdFn = new NodejsFunction(this, 'tasks-lambdafn', {
      entry: path.join(__dirname, '/../../src/tasks/index.ts'),
      environment: {
        DYNAMODB_TABLE_NAME: props.fileUploadTable.tableName,
        PRIMARY_KEY: 'id',
      },
      ...getFnProps(),
    });

    props.fileUploadTable.grantReadWriteData(lambdFn);
    return lambdFn;
  }
}
