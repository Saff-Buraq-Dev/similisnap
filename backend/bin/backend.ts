#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { BackendStack } from '../lib/backend-stack';
import { FrontendStack } from '../lib/frontend-stack';


const env_sg_aws_prod_ca_central_1 = {
    account: '640111341785',
    region: 'ca-central-1'
}

const app = new cdk.App();
new BackendStack(app, 'BackendStack', {
});

new FrontendStack(app, 'FrontendStack', {
    paramProjectName: 'similisnap',
    paramProjectEnv: 'prd',
    paramProjectId: '01',
    paramHostedZoneId: 'Z09125231W8DILLQ8TFEH',
    env: env_sg_aws_prod_ca_central_1
});