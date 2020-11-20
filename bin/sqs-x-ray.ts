#!/usr/bin/env node
import "source-map-support/register";
import * as cdk from "@aws-cdk/core";

import {SqsXRayStack} from "../lib/lambda-sqs-lambda-x-ray-stack";
import {LambdaSnsSqsLambdaXRayStack} from "../lib/lambda-sns-sqs-lambda-x-ray-stack";
const app = new cdk.App();
// new SqsXRayStack(app, "SqsXRayStack", {});
new LambdaSnsSqsLambdaXRayStack(app, "LambdaSnsSqsLambdaXRayStack");