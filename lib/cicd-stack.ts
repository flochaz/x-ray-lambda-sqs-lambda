/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
  
Licensed under the Apache License, Version 2.0 (the "License").
You may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/

import { Construct, Stage, Stack } from "@aws-cdk/core";
import { CdkPipeline, SimpleSynthAction } from "@aws-cdk/pipelines";
import * as codepipeline from "@aws-cdk/aws-codepipeline";
import * as codepipeline_actions from "@aws-cdk/aws-codepipeline-actions";
import * as core from "@aws-cdk/core";
import { SqsXRayStack }  from './sqs-x-ray-stack';

export class LambdaSQSLambdaStage extends Stage {
  constructor(scope: Construct, id: string, props: core.StackProps) {
    super(scope, id, props);

    new SqsXRayStack(this, 'LambdaSQSLambdaStack', props);
  }
}

/**
 * Stack to hold the pipeline
 */
export class LambdaSQSLambdaPipelineStack extends Stack {
  constructor(scope: Construct, id: string, props: core.StackProps) {
    super(scope, id, props);

    const sourceArtifact = new codepipeline.Artifact();
    const cloudAssemblyArtifact = new codepipeline.Artifact();

    const pipeline = new CdkPipeline(this, "Pipeline", {
      pipelineName: "AWSBootstrapKit-LambdaSQSLambda",
      cloudAssemblyArtifact,

      sourceAction: new codepipeline_actions.GitHubSourceAction({
        actionName: "GitHub",
        output: sourceArtifact,
        branch: "main",
        oauthToken: core.SecretValue.secretsManager("GITHUB_TOKEN"),
        owner: 'flochaz',
        repo: "x-ray-lambda-sqs-lambda",
      }),

      synthAction: SimpleSynthAction.standardYarnSynth({
        sourceArtifact,
        cloudAssemblyArtifact
      }),
    });

    pipeline.addApplicationStage(
        new LambdaSQSLambdaStage(this, "Prod", {
            env: {
                account: '289128845841',
                region: 'eu-west-1'
            }
        })
      );
  }
}
