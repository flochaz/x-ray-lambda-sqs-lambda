const AWSXRay = require("aws-xray-sdk");
var AWS = require('aws-sdk');

exports.handler = async function (event, context) {
  const lambdaExecStartTime = new Date().getTime() / 1000;
  const sleep = (milliseconds) => {
    return new Promise((resolve) => setTimeout(resolve, milliseconds));
  };
  for (const recordIndex in event.Records) {
    // Extract X-Ray data from message

    const record = event.Records[recordIndex];
    console.log(`record ${JSON.stringify(record)}`);
    const traceHeaderStr = record.attributes.AWSTraceHeader;
    const traceData = AWSXRay.utils.processTraceData(traceHeaderStr);

    // Create SQS segment

    const SQSSegment = new AWSXRay.Segment(
      "SQS",
      traceData.root,
      traceData.parent
    );
    console.log(`TraceId to filter on in Xray: ${traceData.root}`);
    delete SQSSegment.service;
    SQSSegment.origin = "AWS::SQS";
    SQSSegment.inferred = true;

    SQSSegment.start_time = record.attributes.SentTimestamp / 1000;
    SQSSegment.end_time =
      record.attributes.ApproximateFirstReceiveTimestamp / 1000;
    SQSSegment.addPluginData({
      operation: "SendEvent",
      region: record.awsRegion,
      request_id: context.awsRequestId,
      queue_url: record.eventSourceARN,
    });
    SQSSegment.close();

    // Create Lambda segment

    // TODO: Add subsegment for init phase (cold start etc.) with: start_time = lambdaExecStartTime - (lambdaExecStartTime - SQSSegment.end_time)

    const lambdaSegment = new AWSXRay.Segment(
      "ConsumerPerMessageLogicSegment",
      traceData.root,
      SQSSegment.id
    );
    delete lambdaSegment.service;
    lambdaSegment.origin = "AWS::Lambda::Function";
    lambdaSegment.inferred = true;
    lambdaSegment.start_time = lambdaExecStartTime - (lambdaExecStartTime - SQSSegment.end_time); 
    lambdaSegment.addPluginData({
      operation: "invoke",
      region: record.awsRegion,
      request_id: context.awsRequestId,
    });

    const { body } = record;
    console.log(body);

    // Add an external call in a subsegment
    const ssmSubSegment = lambdaSegment.addNewSubsegment('AWS::SecretsManager::ListSecrets');
    ssmSubSegment.addAttribute("namespace", 'aws');
    var ssm = new AWS.SecretsManager();
    await ssm.listSecrets().promise();
    ssmSubSegment.close();
    lambdaSegment.close();
  }
  return {};
};