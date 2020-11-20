import * as cdk from '@aws-cdk/core';
import * as lambda from '@aws-cdk/aws-lambda';

import { SnsToSqs  } from "@aws-solutions-constructs/aws-sns-sqs";
import { LambdaToSns } from "@aws-solutions-constructs/aws-lambda-sns";
import {  SqsToLambda } from "@aws-solutions-constructs/aws-sqs-lambda";
import * as iam from '@aws-cdk/aws-iam';

export class LambdaSnsSqsLambdaXRayStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);


    const consumerRole = new iam.Role(this, "consumerRole", {
      roleName: "SNSSQSConsumerRole",
      assumedBy: new iam.ServicePrincipal("lambda.amazonaws.com"),
      managedPolicies:[
        iam.ManagedPolicy.fromAwsManagedPolicyName("AdministratorAccess"),  // DO NOT USE IN PROD
      ]
    })

    const lambdaToSns = new LambdaToSns(this, 'LambdaToSns', {
      lambdaFunctionProps: {
        functionName: 'SNSProducer',
          runtime: lambda.Runtime.NODEJS_12_X,
          handler: 'index.handler',
          code: lambda.Code.fromAsset(`${__dirname}/lambda/sns-producer-function`)
      }
    })
    const snsToSqs = new SnsToSqs(this, 'SnsToSqs', {
      existingTopicObj: lambdaToSns.snsTopic
    })
    new SqsToLambda(this, 'SqsTOLambda', {
      existingQueueObj: snsToSqs.sqsQueue,
      lambdaFunctionProps: {
        functionName: 'SNSSQSConsumer',
          runtime: lambda.Runtime.NODEJS_12_X,
          handler: 'index.handler',
          code: lambda.Code.fromAsset(`${__dirname}/lambda/consumer-function`),
          role: consumerRole,
          tracing: lambda.Tracing.DISABLED
      }
    })
  }
}
