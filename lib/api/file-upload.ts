import {
  AuthorizationType,
  IAuthorizer,
  LambdaIntegration,
  LambdaRestApi,
  MethodOptions,
} from 'aws-cdk-lib/aws-apigateway';
import { IFunction } from 'aws-cdk-lib/aws-lambda';
import { Construct } from 'constructs';

interface IFileUpload {
  fileUploadFn: IFunction;
  authorizer: IAuthorizer;
}

export class FileUploadApiGateway extends Construct {
  constructor(scope: Construct, id: string, props: IFileUpload) {
    super(scope, id);
    this.createFileUploadApis(props.fileUploadFn, props.authorizer);
  }

  private createFileUploadApis(fileUploadFn: IFunction, auth: IAuthorizer) {
    const fileUploadApiGateway = new LambdaRestApi(this, 'file-upload-api', {
      handler: fileUploadFn,
      restApiName: 'fileUpload-api',
      proxy: false,
      description: 'file upload api behind the cognito pool authorizer',
      deployOptions: {
        stageName: 'dev',
      },

      // binaryMediaTypes: ['*/*'],
    });

    const httpIntegration = new LambdaIntegration(fileUploadFn);
    const options: MethodOptions = {
      authorizer: auth,
      authorizationType: AuthorizationType['COGNITO'],
    };
    const fileUpload = fileUploadApiGateway.root.addResource('file-upload');
    fileUpload.addMethod('GET', httpIntegration, options);
    fileUpload.addMethod('PUT', httpIntegration, options);
  }
}
