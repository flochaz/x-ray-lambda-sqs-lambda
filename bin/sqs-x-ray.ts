#!/usr/bin/env node
import "source-map-support/register";
import * as cdk from "@aws-cdk/core";

import {SqsXRayStack} from "../lib/sqs-x-ray-stack";

const app = new cdk.App();
new SqsXRayStack(app, "SqsXRayStack", {});
