// Load the AWS SDK for Node.js
var AWS = require("aws-sdk");

exports.handler = async function () {
  // Create an SQS service object
  var sqs = new AWS.SQS({ apiVersion: "2012-11-05" });

  var params = {
    // Remove DelaySeconds parameter and value for FIFO queues
    DelaySeconds: 10,
    MessageSystemAttributes: {
            AWSTraceHeader: {
              DataType: 'String',
              StringValue: process.env._X_AMZN_TRACE_ID
            }
    },
    MessageAttributes: {
      Title: {
        DataType: "String",
        StringValue: "The Whistler",
      },
      Author: {
        DataType: "String",
        StringValue: "John Grisham",
      },
      WeeksOn: {
        DataType: "Number",
        StringValue: "6",
      },
    },
    MessageBody:
      "Information about current NY Times fiction bestseller for week of 12/11/2016.",
    // MessageDeduplicationId: "TheWhistler",  // Required for FIFO queues
    // MessageGroupId: "Group1",  // Required for FIFO queues
    QueueUrl: process.env.SQS_QUEUE_URL,
  };
  
  try {
    console.log("Sending message");
    const data = await sqs.sendMessage(params).promise();
    console.log("Success", data.MessageId);
  } catch (e) {
          console.log("Error", e);
          throw(e);
  }
};
