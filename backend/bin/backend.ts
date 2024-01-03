#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { BackendStack } from '../lib/backend-stack';
import { FrontendStack } from '../lib/frontend-stack';

const app = new cdk.App();
new BackendStack(app, 'BackendStack', {
});

new FrontendStack(app, 'FrontendStack', {
    paramProjectName: 'similisnap',
    paramProjectEnv: 'prd',
    paramProjectId: '01',
    paramHostedZoneId: 'Z09125231W8DILLQ8TFEH'
});