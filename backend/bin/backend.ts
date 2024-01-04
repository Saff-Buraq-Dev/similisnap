#!/usr/bin/env node
import 'source-map-support/register';
import { BackendStack } from '../lib/backend-stack';
import { FrontendStack } from '../lib/frontend-stack';
import { App } from 'aws-cdk-lib';


const env_sg_aws_prod_ca_central_1 = {
    account: '640111341785',
    region: 'ca-central-1'
}

const app = new App();
new BackendStack(app, 'BackendStack', {
    paramProjectName: 'similisnap-backend',
    paramProjectEnv: 'prd',
    paramProjectId: '01',
    paramCertificateArn: 'arn:aws:acm:us-east-1:640111341785:certificate/bd38c478-8bfa-44db-82e0-6500638c2867',
    paramLambdaAuthorizerArn: 'arn:aws:lambda:ca-central-1:640111341785:function:UtilityStack-APIGatewayFirebaseAuthorizer7F10DE6A-edRTkX2SNXDP'
});

new FrontendStack(app, 'FrontendStack', {
    paramProjectName: 'similisnap',
    paramProjectEnv: 'prd',
    paramProjectId: '01',
    paramCertificateArn: 'arn:aws:acm:us-east-1:640111341785:certificate/3c75226f-0771-4264-889c-22daa4e7e4f8',
    env: env_sg_aws_prod_ca_central_1
});