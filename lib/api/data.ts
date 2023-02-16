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

interface IDataUpload {
  dataFn: IFunction;
  authorizer: IAuthorizer;
}

export class DataApiGateway extends Construct {
  apiGatewayRole: Role;
  constructor(scope: Construct, id: string, props: IDataUpload) {
    super(scope, id);
    this.createDataApis(props.dataFn, props.authorizer);
  }

  private createDataApis(dataFn: IFunction, auth: IAuthorizer) {
    const dataApiGateway = new LambdaRestApi(this, 'data-api', {
      handler: dataFn,
      proxy: false,
      restApiName: 'data-api',
      description: 'data api behind the cognito pool authorizer',
      deployOptions: {
        stageName: 'dev',
      },
    });

    const httpIntegration = new LambdaIntegration(dataFn);
    const options: MethodOptions = {
      authorizer: auth,
      authorizationType: AuthorizationType['COGNITO'],
    };
    const dataRestApi = dataApiGateway.root.addResource('data'); // /data
    dataRestApi.addMethod('GET', httpIntegration, options);
    dataRestApi.addMethod('POST', httpIntegration, options);
    const dataRes = dataRestApi.addResource('{id}'); // /data/:id
    dataRes.addMethod('GET', httpIntegration, options);
    dataRes.addMethod('PATCH', httpIntegration, options);
    dataRes.addMethod('DELETE', httpIntegration, options);
  }
}
