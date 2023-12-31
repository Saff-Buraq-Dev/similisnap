import { Duration, RemovalPolicy, Stack, StackProps } from 'aws-cdk-lib';
import { AuthorizationType, Cors, LambdaIntegration, RestApi, TokenAuthorizer } from 'aws-cdk-lib/aws-apigateway';
import { Code, DockerImageCode, DockerImageFunction, Function, Runtime } from 'aws-cdk-lib/aws-lambda';
import { Construct } from 'constructs';
import { Certificate, CertificateValidation } from 'aws-cdk-lib/aws-certificatemanager';
import { EndpointType } from 'aws-cdk-lib/aws-apigatewayv2';
import { AttributeType, BillingMode, Table } from 'aws-cdk-lib/aws-dynamodb';
import { BlockPublicAccess, Bucket, EventType, HttpMethods } from 'aws-cdk-lib/aws-s3';
import { S3EventSource } from 'aws-cdk-lib/aws-lambda-event-sources';

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

  private picturesBucket: Bucket;

  private lambdaFunctionGetSignedUrl: Function;
  private lambdaFunctionPostUser: Function;
  private lambdaFunctionUpdateProfile: Function;
  private lambdaFunctionGetUserProfile: Function;

  private lambdaFunctionClassifyImages: DockerImageFunction;

  constructor(scope: Construct, id: string, props: BackendStackProps) {
    super(scope, id, props);

    /*************************************************************************
     ***********************      API CERTIFICATE     ************************
     *************************************************************************/
    this.apiCertificate = new Certificate(this, 'SimiliSnapCertificate', {
      domainName: 'api.similisnap.gharbidev.com',
      validation: CertificateValidation.fromDns()
    });

    /*************************************************************************
     ************************      PHOTOS BUCKET     *************************
     *************************************************************************/
    this.picturesBucket = new Bucket(this, 'SimilisnapPicturesBucket', {
      bucketName: `${props.paramProjectName}-${props.paramProjectEnv}-${props.paramProjectId}-similisnap-photos-bucket`
        .toLowerCase(),
      publicReadAccess: false,
      blockPublicAccess: BlockPublicAccess.BLOCK_ALL,
      removalPolicy: RemovalPolicy.RETAIN,
      cors: [
        {
          allowedMethods: [HttpMethods.HEAD, HttpMethods.GET, HttpMethods.PUT],
          allowedOrigins: ['*'],
          allowedHeaders: ['Authorization', '*'],
        },
      ],
    });

    /*************************************************************************
     *************************      DDB USERS      ***************************
     *************************************************************************/
    this.usersPreferencesTable = new Table(this, 'UsersTable', {
      partitionKey: { name: 'uid', type: AttributeType.STRING },
      deletionProtection: true,
      billingMode: BillingMode.PAY_PER_REQUEST
    });


    /*************************************************************************
     *************************      API GATEWAY     **************************
     *************************************************************************/
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
        allowMethods: Cors.ALL_METHODS,
        allowOrigins: Cors.ALL_ORIGINS,
        allowCredentials: true,
        allowHeaders: ['Authorization', '*'],
      },

    });

    // Dependency between api gateway and certificate
    this.apiGateway.node.addDependency(this.apiCertificate);

    // Authorizer
    this.authorizer = new TokenAuthorizer(this, 'SimiliSnapAuthorizer', {
      handler: Function.fromFunctionArn(this, 'lambdaAuthorizer', props.paramLambdaAuthorizerArn),
      authorizerName: 'SimiliSnapAuthorizer',
    });


    /*************************************************************************
     *******************      API LAMBDAS INTEGRATION     ********************
     *************************************************************************/
    // Lambda Post user
    this.lambdaFunctionPostUser = new Function(this, 'APIGatewayFirebaseAuthorizer', {
      functionName: `${props.paramProjectName}-${props.paramProjectEnv}-${props.paramProjectId}-lambdaWelcomeUsers`,
      code: Code.fromAsset(path.join(__dirname, 'lambdas', 'post-user')),
      handler: 'lambda_function.lambda_handler',
      runtime: Runtime.PYTHON_3_12,
      timeout: Duration.seconds(30),
      environment: {
        DDB_TABLE: this.usersPreferencesTable.tableName
      }
    });

    this.usersPreferencesTable.grantReadWriteData(this.lambdaFunctionPostUser);

    const usersResource = this.apiGateway.root.addResource('users');
    usersResource.addMethod('POST', new LambdaIntegration(this.lambdaFunctionPostUser), {
      authorizer: this.authorizer,
      authorizationType: AuthorizationType.CUSTOM
    });

    // Lambda update profile
    this.lambdaFunctionUpdateProfile = new Function(this, 'lambdaFunctionUpdateProfile', {
      functionName: `${props.paramProjectName}-${props.paramProjectEnv}-${props.paramProjectId}-lambdaUpdateProfile`,
      code: Code.fromAsset(path.join(__dirname, 'lambdas', 'put-user')),
      handler: 'lambda_function.lambda_handler',
      runtime: Runtime.PYTHON_3_12,
      timeout: Duration.seconds(30),
      environment: {
        DDB_TABLE: this.usersPreferencesTable.tableName
      }
    });

    this.usersPreferencesTable.grantReadWriteData(this.lambdaFunctionUpdateProfile);
    usersResource.addMethod('PUT', new LambdaIntegration(this.lambdaFunctionUpdateProfile), {
      authorizer: this.authorizer,
      authorizationType: AuthorizationType.CUSTOM
    });

    // Lambda get user profile
    this.lambdaFunctionGetUserProfile = new Function(this, 'lambdaFunctionGetUserProfile', {
      functionName: `${props.paramProjectName}-${props.paramProjectEnv}-${props.paramProjectId}-lambdaGetUserProfile`,
      code: Code.fromAsset(path.join(__dirname, 'lambdas', 'get-user')),
      handler: 'lambda_function.lambda_handler',
      runtime: Runtime.PYTHON_3_12,
      timeout: Duration.seconds(30),
      environment: {
        DDB_TABLE: this.usersPreferencesTable.tableName,
        BUCKET_NAME: this.picturesBucket.bucketName,
      }
    });

    this.picturesBucket.grantRead(this.lambdaFunctionGetUserProfile);
    this.usersPreferencesTable.grantReadData(this.lambdaFunctionGetUserProfile);

    // Define a new resource for /users/{uid}
    const userResource = usersResource.addResource('{uid}');
    userResource.addMethod('GET', new LambdaIntegration(this.lambdaFunctionGetUserProfile), {
      authorizer: this.authorizer,
      authorizationType: AuthorizationType.CUSTOM
    });

    this.lambdaFunctionGetSignedUrl = new Function(this, 'lambdaGetSignedUrl', {
      functionName: `${props.paramProjectName}-${props.paramProjectEnv}-${props.paramProjectId}-lambdaGetSignedUrl`,
      code: Code.fromAsset(path.join(__dirname, 'lambdas', 'get-signed-url')),
      handler: 'lambda_function.lambda_handler',
      runtime: Runtime.PYTHON_3_12,
      timeout: Duration.seconds(30),
      environment: {
        DDB_TABLE: this.usersPreferencesTable.tableName,
        BUCKET_NAME: this.picturesBucket.bucketName
      }
    });

    // The lambda needs the put action on the bucket
    this.picturesBucket.grantPut(this.lambdaFunctionGetSignedUrl);

    // RESOURCE FOR UPLOAD
    const uploadResource = this.apiGateway.root.addResource('upload');
    uploadResource.addMethod('POST', new LambdaIntegration(this.lambdaFunctionGetSignedUrl), {
      authorizer: this.authorizer,
      authorizationType: AuthorizationType.CUSTOM
    });


    /**
    const lambdaClassifyImagesLayer = new PythonLayerVersion(this, 'lambdaClassifyImagesLayer', {
      compatibleRuntimes: [Runtime.PYTHON_3_11, Runtime.PYTHON_3_10, Runtime.PYTHON_3_9],
      entry: 'lib/lambdas/layers/classify-images-layer',
    });

    // Lambda classify images
    this.lambdaFunctionClassifyImages = new PythonFunction(this, 'lambdaClassifyImages', {
      functionName: `${props.paramProjectName}-${props.paramProjectEnv}-${props.paramProjectId}-lambdaFunctionClassifyImages`,
      entry: 'lib/lambdas/classify-images',
      index: 'lambda_function.py',
      handler: 'lambda_handler',
      runtime: Runtime.PYTHON_3_11,
      timeout: Duration.minutes(3),
      memorySize: 2048,
      layers: [lambdaClassifyImagesLayer],
    });
     */

    this.lambdaFunctionClassifyImages = new DockerImageFunction(this, "lambdaDocker", {
      code: DockerImageCode.fromImageAsset('lib/lambdas/classify-images'),
    })

    this.picturesBucket.grantReadWrite(this.lambdaFunctionClassifyImages);
    const s3EventSource = new S3EventSource(this.picturesBucket, {
      events: [EventType.OBJECT_CREATED_PUT, EventType.OBJECT_CREATED_POST]
    });
    this.lambdaFunctionClassifyImages.addEventSource(s3EventSource);
  }
}
