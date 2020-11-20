var AWSXRay = require('aws-xray-sdk');
var AWS = AWSXRay.captureAWS(require('aws-sdk'));

exports.handler = function(event, context, callback) {
    var sns = new AWS.SNS();

    sns.publish({
	 // You can replace the following line with your custom message.
        Message: process.env.MESSAGE || "Testing X-Ray trace header propagation", 
        TopicArn: process.env.SNS_TOPIC_ARN
    }, function(err, data) {
        if (err) {
            console.log(err.stack);
            callback(err);
        } else {
            callback(null, "Message sent.");
        }
    });
};