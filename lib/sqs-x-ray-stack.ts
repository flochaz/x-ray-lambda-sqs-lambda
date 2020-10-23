import * as cdk from '@aws-cdk/core';
import * as lambda from '@aws-cdk/aws-lambda';
import { LambdaToSqsToLambda } from "@aws-solutions-constructs/aws-lambda-sqs-lambda";

export class SqsXRayStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    new LambdaToSqsToLambda(this, 'LambdaToSqsToLambdaPattern', {
      producerLambdaFunctionProps: {
          runtime: lambda.Runtime.NODEJS_12_X,
          handler: 'index.handler',
          code: lambda.Code.fromAsset(`${__dirname}/lambda/producer-function`)
      },
      consumerLambdaFunctionProps: {
        runtime: lambda.Runtime.NODEJS_12_X,
        handler: 'index.handler',
        code: lambda.Code.fromAsset(`${__dirname}/lambda/consumer-function`)
      }
  });
  }
}
