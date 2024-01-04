import { Duration, Stack, StackProps } from 'aws-cdk-lib';
import { AuthorizationType, Cors, LambdaIntegration, RestApi, TokenAuthorizer } from 'aws-cdk-lib/aws-apigateway';
import { Code, Function, Runtime } from 'aws-cdk-lib/aws-lambda';
import { Construct } from 'constructs';
import { Certificate, CertificateValidation } from 'aws-cdk-lib/aws-certificatemanager';
import { EndpointType } from 'aws-cdk-lib/aws-apigatewayv2';
import { AttributeType, BillingMode, Table } from 'aws-cdk-lib/aws-dynamodb';

const path = require('path');

interface BackendStackProps extends StackProps {
  paramProjectName: string;
  paramProjectEnv: string;
  paramProjectId: string;
  paramLambdaAuthorizerArn: string;
}

export class BackendStack extends Stack {

  private usersPreferencesTable: Table;
  private apiCertificate: Certificate;
  private apiGateway: RestApi;
  private authorizer: TokenAuthorizer;

  private lambdaFunctionWelcomeUser: Function;

  constructor(scope: Construct, id: string, props: BackendStackProps) {
    super(scope, id, props);

    this.apiCertificate = new Certificate(this, 'SimiliSnapCertificate', {
      domainName: 'api.similisnap.gharbidev.com',
      validation: CertificateValidation.fromDns()
    });

    this.usersPreferencesTable = new Table(this, 'UsersTable', {
      partitionKey: { name: 'uid', type: AttributeType.STRING },
      deletionProtection: true,
      billingMode: BillingMode.PAY_PER_REQUEST
    });

    // API Gateway
    this.apiGateway = new RestApi(this, 'SimiliSnapApi', {
      restApiName: `${props.paramProjectName}-${props.paramProjectEnv}-${props.paramProjectId}-similisnapapi`,
      description: 'SimiliSnap API',
      deploy: true,
      domainName: {
        domainName: 'api.similisnap.gharbidev.com',
        certificate: this.apiCertificate,
        endpointType: EndpointType.REGIONAL,
      },
      defaultCorsPreflightOptions: {
        allowOrigins: Cors.ALL_ORIGINS
      }
    });

    // Dependency between api gateway and certificate
    this.apiGateway.node.addDependency(this.apiCertificate);

    // Authorizer
    this.authorizer = new TokenAuthorizer(this, 'SimiliSnapAuthorizer', {
      handler: Function.fromFunctionArn(this, 'lambdaAuthorizer', props.paramLambdaAuthorizerArn),
      authorizerName: 'SimiliSnapAuthorizer',
    });

    // Lambda welcome users
    this.lambdaFunctionWelcomeUser = new Function(this, 'APIGatewayFirebaseAuthorizer', {
      functionName: `${props.paramProjectName}-${props.paramProjectEnv}-${props.paramProjectId}-lambdaWelcomeUsers`,
      code: Code.fromAsset(path.join(__dirname, 'lambdas', 'handle-photos-upload')),
      handler: 'lambda_function.lambda_handler',
      runtime: Runtime.PYTHON_3_12,
      timeout: Duration.seconds(30),
      environment: {
        DDB_TABLE: this.usersPreferencesTable.tableName
      }
    });

    this.usersPreferencesTable.grantReadWriteData(this.lambdaFunctionWelcomeUser);

    const usersResource = this.apiGateway.root.addResource('users');
    usersResource.addMethod('POST', new LambdaIntegration(this.lambdaFunctionWelcomeUser), {
      authorizer: this.authorizer,
      authorizationType: AuthorizationType.CUSTOM
    });
  }
}
