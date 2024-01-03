#!/usr/bin/env node
import 'source-map-support/register';
import { BackendStack } from '../lib/backend-stack';
import { FrontendStack } from '../lib/frontend-stack';
import { App } from 'aws-cdk-lib';


const env_sg_aws_prod_ca_central_1 = {
    account: '640111341785',
    region: 'us-east-1'
}

const app = new App();
new BackendStack(app, 'BackendStack', {
});

new FrontendStack(app, 'FrontendStack', {
    paramProjectName: 'similisnap',
    paramProjectEnv: 'prd',
    paramProjectId: '01',
    paramHostedZoneId: 'Z09125231W8DILLQ8TFEH',
    paramCertificateArn: 'arn:aws:acm:us-east-1:640111341785:certificate/3c75226f-0771-4264-889c-22daa4e7e4f8',
    env: env_sg_aws_prod_ca_central_1
});