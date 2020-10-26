#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from '@aws-cdk/core';
import { LambdaSQSLambdaPipelineStack } from '../lib/cicd-stack';

const app = new cdk.App();
new LambdaSQSLambdaPipelineStack(app, 'SqsXRayStack', {
    env: {
      account: '377591626254',
      region: 'eu-west-1',
    }
  });
