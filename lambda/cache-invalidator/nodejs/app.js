const AWS = require('aws-sdk');

const distributionIdsString = process.env.MAPS_CLOUDFRONT_DISTRIBUTION_IDS;
const distributionIds = distributionIdsString.split(',');

/**
 *
 * Event doc: https://docs.aws.amazon.com/apigateway/latest/developerguide/set-up-lambda-proxy-integrations.html#api-gateway-simple-proxy-for-lambda-input-format
 * @param {Object} event - API Gateway Lambda Proxy Input Format
 *
 * Context doc: https://docs.aws.amazon.com/lambda/latest/dg/nodejs-prog-model-context.html 
 * @param {Object} context
 *
 * Return doc: https://docs.aws.amazon.com/apigateway/latest/developerguide/set-up-lambda-proxy-integrations.html
 * @returns {Object} object - API Gateway Lambda Proxy Output Format
 * 
 */
exports.lambdaHandler = async (event, context) => {
    const cloudfront = new AWS.CloudFront();
    const invalidationPaths = ['/*']; // Paths to invalidate, right now assume it's the root for all services
    const results = [];

    for (const distributionId of distributionIds) {
        const params = {
            DistributionId: distributionId,
            InvalidationBatch: {
                CallerReference: Date.now().toString(),
                Paths: {
                    Quantity: invalidationPaths.length,
                    Items: invalidationPaths
                }
            }
        };

        try {
            const result = await cloudfront.createInvalidation(params).promise();
            console.log('Invalidation request submitted:', result.Invalidation);
            results.push({
                statusCode: 200,
                message: `Successfully submitted request ${result.Invalidation}`
            });
        } catch (error) {
            console.error('Error occurred:', error);
            results.push({
                statusCode: 500,
                message: `${error} While invalidating cache ${distributionId}`
            })
        }

        return {
            statusCode: 200,
            body: JSON.stringify(results)
        };
    }
}
