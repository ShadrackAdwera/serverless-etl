import { RemovalPolicy } from 'aws-cdk-lib';
import {
  CognitoUserPoolsAuthorizer,
  IAuthorizer,
} from 'aws-cdk-lib/aws-apigateway';
import {
  AccountRecovery,
  UserPool,
  UserPoolClientIdentityProvider,
} from 'aws-cdk-lib/aws-cognito';
import { Construct } from 'constructs';

export class CognitoAuthorizer extends Construct {
  public readonly cognitoAuthorizer: IAuthorizer;
  constructor(scope: Construct, id: string) {
    super(scope, id);
    this.cognitoAuthorizer = this.authorizer();
  }

  private userPool(): UserPool {
    const pool = new UserPool(this, 'etl-user-pool', {
      userPoolName: 'etl-user-pool',
      removalPolicy: RemovalPolicy['DESTROY'],
      selfSignUpEnabled: true,
      signInAliases: { email: true },
      autoVerify: { email: true },
      passwordPolicy: {
        minLength: 6,
        requireLowercase: false,
        requireDigits: false,
        requireUppercase: false,
        requireSymbols: false,
      },
      accountRecovery: AccountRecovery['EMAIL_ONLY'],
    });
    pool.addClient('auth-flow', {
      authFlows: {
        adminUserPassword: true,
        userPassword: true,
        custom: true,
        userSrp: true,
      },
      userPoolClientName: 'auth-user-pool',
      supportedIdentityProviders: [UserPoolClientIdentityProvider['COGNITO']],
    });
    return pool;
  }

  private authorizer(): CognitoUserPoolsAuthorizer {
    return new CognitoUserPoolsAuthorizer(this, 'etl-user-pool-authorizer', {
      cognitoUserPools: [this.userPool()],
      authorizerName: 'etl-user-pool-authorizer',
    });
  }
}
