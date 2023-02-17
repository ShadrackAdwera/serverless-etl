import {
  AuthorizationType,
  IAuthorizer,
  LambdaIntegration,
  LambdaRestApi,
  MethodOptions,
} from 'aws-cdk-lib/aws-apigateway';
import { Role } from 'aws-cdk-lib/aws-iam';
import { IFunction } from 'aws-cdk-lib/aws-lambda';
import { Construct } from 'constructs';

interface IFileUpload {
  fileUploadFn: IFunction;
  authorizer: IAuthorizer;
}

export class FileUploadApiGateway extends Construct {
  apiGatewayRole: Role;
  constructor(scope: Construct, id: string, props: IFileUpload) {
    super(scope, id);
    this.createFileUploadApis(props.fileUploadFn, props.authorizer);
    //this.createRestApi(props.authorizer, props.bucket);
  }

  // private createRestApi(auth: IAuthorizer, bucket: IBucket) {
  //   const restApi = new RestApi(this, 'upload-to-s3-rest-api', {
  //     restApiName: 'fileUpload-api',
  //     description: 'file upload api behind the cognito pool authorizer',
  //     endpointConfiguration: {
  //       types: [EndpointType.EDGE],
  //     },
  //     binaryMediaTypes: ['application/octet-stream', 'text/csv'],
  //   });
  //   const bucketItemResource = restApi.root.addResource('file-upload');
  //   this.apiGatewayRole = new Role(this, 'api-gateway-role', {
  //     assumedBy: new ServicePrincipal('apigateway.amazonaws.com'),
  //   });

  //   //PutObject method
  //   this.addActionToPolicy('s3:PutObject');
  //   const putObjectIntegration = new AwsIntegration({
  //     service: 's3',
  //     region: 'us-east-1',
  //     path: '/file-upload',
  //     integrationHttpMethod: 'PUT',
  //     options: {
  //       credentialsRole: this.apiGatewayRole,
  //       passthroughBehavior: PassthroughBehavior.WHEN_NO_TEMPLATES,
  //       requestParameters: {
  //         'integration.request.path.bucket': bucket.bucketName,
  //         'integration.request.path.object': `file-${randomUUID()}`,
  //         'integration.request.header.Accept': 'method.request.header.Accept',
  //       },
  //       integrationResponses: [
  //         {
  //           statusCode: '201',
  //           responseParameters: {
  //             'method.response.header.Content-Type':
  //               'integration.response.header.Content-Type',
  //           },
  //         },
  //       ],
  //     },
  //   });

  //   //PutObject method options
  //   const putObjectMethodOptions: MethodOptions = {
  //     authorizer: auth,
  //     requestParameters: {
  //       'method.request.header.Accept': true,
  //       'method.request.header.Content-Type': true,
  //     },
  //     methodResponses: [
  //       {
  //         statusCode: '200',
  //         responseParameters: {
  //           'method.response.header.Content-Type': true,
  //         },
  //       },
  //     ],
  //   };
  //   bucketItemResource.addMethod(
  //     'PUT',
  //     putObjectIntegration,
  //     putObjectMethodOptions
  //   );
  // }

  // private addActionToPolicy(action: string) {
  //   this.apiGatewayRole.addToPolicy(
  //     new PolicyStatement({
  //       resources: ['*'],
  //       actions: [`${action}`],
  //     })
  //   );
  // }

  private createFileUploadApis(fileUploadFn: IFunction, auth: IAuthorizer) {
    const fileUploadApiGateway = new LambdaRestApi(this, 'file-upload-api', {
      handler: fileUploadFn,
      proxy: false,
      restApiName: 'fileUpload-api',
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
