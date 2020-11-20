import * as cdk from '@aws-cdk/core';
import * as lambda from '@aws-cdk/aws-lambda';
import { LambdaToSqsToLambda } from "@aws-solutions-constructs/aws-lambda-sqs-lambda";
import * as iam from '@aws-cdk/aws-iam';

export class SqsXRayStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);


    const consumerRole = new iam.Role(this, "consumerRole", {
      roleName: "SQSCOnsumerRole",
      assumedBy: new iam.ServicePrincipal("lambda.amazonaws.com"),
      managedPolicies:[
        iam.ManagedPolicy.fromAwsManagedPolicyName("AmazonSQSFullAccess"),  // DO NOT USE IN PROD
        iam.ManagedPolicy.fromAwsManagedPolicyName("AWSXrayFullAccess"), // DO NOT USE IN PROD
        iam.ManagedPolicy.fromAwsManagedPolicyName("AWSLambdaExecute") // DO NOT USE IN PROD
      ]
    })

    new LambdaToSqsToLambda(this, 'LambdaToSqsToLambdaPattern', {
      producerLambdaFunctionProps: {
        functionName: 'Producer',
          runtime: lambda.Runtime.NODEJS_12_X,
          handler: 'index.handler',
          code: lambda.Code.fromAsset(`${__dirname}/lambda/producer-function`)
      },
      consumerLambdaFunctionProps: {
        functionName: 'Consumer',
        runtime: lambda.Runtime.NODEJS_12_X,
        handler: 'index.handler',
        code: lambda.Code.fromAsset(`${__dirname}/lambda/consumer-function`),
        tracing: lambda.Tracing.DISABLED,
        role: consumerRole
      }
  });
  }
}
