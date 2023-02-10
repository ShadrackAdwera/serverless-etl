import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { FileUploadApiGateway } from './api/file-upload';
import { CognitoAuthorizer } from './auth/cognito-authorizer';
import { FileUploadTable } from './database/file-upload-db';
import { EtlFnLambdaConstruct } from './lambda/etl-fn';
import { FileUploadLambdaConstruct } from './lambda/file-upload-fn';
import { EtlS3Construct } from './storage/s3-construct';
// import * as sqs from 'aws-cdk-lib/aws-sqs';

export class AwsEtlStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const { dynamoFileUploadTable } = new FileUploadTable(
      this,
      'dynamodb-file-upload-table'
    );
    const { bucket } = new EtlS3Construct(this, 'aws-etl-project-s3-bucket');
    const { cognitoAuthorizer, userPoolClientId, userPoolId } =
      new CognitoAuthorizer(this, 'cognito-file-upload-authorizer');
    const { fileUploadFn } = new FileUploadLambdaConstruct(
      this,
      'lambda-file-upload-fn',
      {
        fileUploadTable: dynamoFileUploadTable,
        s3Bucket: bucket,
        userPoolClientId,
        userPoolId,
      }
    );
    new EtlFnLambdaConstruct(this, 'etl-fn-lambda', {
      fileUploadTable: dynamoFileUploadTable,
      userPoolClientId,
      userPoolId,
    });
    new FileUploadApiGateway(this, 'api-gateway-file-upload', {
      authorizer: cognitoAuthorizer,
      fileUploadFn,
    });
  }
}
