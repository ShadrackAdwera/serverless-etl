import { LambdaIntegration, LambdaRestApi } from 'aws-cdk-lib/aws-apigateway';
import { Role } from 'aws-cdk-lib/aws-iam';
import { IFunction } from 'aws-cdk-lib/aws-lambda';
import { Construct } from 'constructs';

interface IDataUpload {
  dataFn: IFunction;
}

export class DataApiGateway extends Construct {
  apiGatewayRole: Role;
  constructor(scope: Construct, id: string, props: IDataUpload) {
    super(scope, id);
    this.createDataApis(props.dataFn);
  }

  private createDataApis(dataFn: IFunction) {
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
    // const options: MethodOptions = {
    //   authorizer: auth,
    //   authorizationType: AuthorizationType['COGNITO'],
    // };
    const dataRestApi = dataApiGateway.root.addResource('data'); // /data
    dataRestApi.addMethod('GET', httpIntegration);
    dataRestApi.addMethod('POST', httpIntegration);
    const dataRes = dataRestApi.addResource('{id}'); // /data/:id
    dataRes.addMethod('GET', httpIntegration);
    dataRes.addMethod('PATCH', httpIntegration);
    dataRes.addMethod('DELETE', httpIntegration);
  }
}
