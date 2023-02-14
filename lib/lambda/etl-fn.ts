import { ITable } from 'aws-cdk-lib/aws-dynamodb';
import { PolicyStatement } from 'aws-cdk-lib/aws-iam';
import {
  FilterCriteria,
  FilterRule,
  Runtime,
  StartingPosition,
} from 'aws-cdk-lib/aws-lambda';
import { DynamoEventSource } from 'aws-cdk-lib/aws-lambda-event-sources';
import {
  NodejsFunction,
  NodejsFunctionProps,
} from 'aws-cdk-lib/aws-lambda-nodejs';
import { IBucket } from 'aws-cdk-lib/aws-s3';
import { Construct } from 'constructs';
import * as path from 'path';

interface ILambdaConstruct {
  fileUploadTable: ITable;
  bucket: IBucket;
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

export class EtlFnLambdaConstruct extends Construct {
  public readonly fileUploadFn: NodejsFunction;
  constructor(scope: Construct, id: string, props: ILambdaConstruct) {
    super(scope, id);
    this.fileUploadFn = this.createLambda(props);
  }

  private createS3PolicyStatement(props: ILambdaConstruct): PolicyStatement {
    const lambdaPolicyStatement = new PolicyStatement();
    lambdaPolicyStatement.addActions('s3:GetObject');
    lambdaPolicyStatement.addResources(`${props.bucket.bucketArn}/*`);
    return lambdaPolicyStatement;
  }

  private createLambda(props: ILambdaConstruct): NodejsFunction {
    const lambdFn = new NodejsFunction(this, 'file-upload-lambdafn', {
      entry: path.join(__dirname, '/../../src/etl/index.ts'),
      environment: {
        DYNAMODB_TABLE_NAME: props.fileUploadTable.tableName,
        USERPOOL_ID: props.userPoolId,
        S3_BUCKET_NAME: props.bucket.bucketName,
        USERPOOL_CLIENT_ID: props.userPoolClientId,
      },
      ...getFnProps(),
    });
    lambdFn.addEventSource(
      new DynamoEventSource(props.fileUploadTable, {
        startingPosition: StartingPosition['LATEST'],
        filters: [
          FilterCriteria.filter({ eventName: FilterRule.isEqual('INSERT') }), // to add a filter for userId
        ],
      })
    );
    lambdFn.addToRolePolicy(this.createS3PolicyStatement(props));
    return lambdFn;
  }
}
