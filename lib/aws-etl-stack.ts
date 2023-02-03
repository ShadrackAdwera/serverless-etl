import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { FileUploadApiGateway } from './api/file-upload';
import { CognitoAuthorizer } from './auth/cognito-authorizer';
import { FileUploadTable } from './database/file-upload-db';
import { FileUploadLambdaConstruct } from './lambda/file-upload-fn';
// import * as sqs from 'aws-cdk-lib/aws-sqs';

export class AwsEtlStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const { dynamoFileUploadTable } = new FileUploadTable(
      this,
      'dynamodb-file-upload-table'
    );
    const { fileUploadFn } = new FileUploadLambdaConstruct(
      this,
      'lambda-file-upload-fn',
      { fileUploadTable: dynamoFileUploadTable }
    );
    const { cognitoAuthorizer } = new CognitoAuthorizer(
      this,
      'cognito-file-upload-authorizer'
    );
    new FileUploadApiGateway(this, 'api-gateway-file-upload', {
      authorizer: cognitoAuthorizer,
      fileUploadFn,
    });
  }
}
