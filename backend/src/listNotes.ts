import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, QueryCommand } from "@aws-sdk/lib-dynamodb";
import { APIGatewayProxyEventV2WithJWTAuthorizer } from "aws-lambda";

const client = new DynamoDBClient({});
const doc = DynamoDBDocumentClient.from(client);

const TABLE = process.env.TABLE_NAME!;

export const handler = async (event: APIGatewayProxyEventV2WithJWTAuthorizer) => {
    try {
        const userId = event.requestContext.authorizer.jwt.claims.sub;

        const res = await doc.send(
            new QueryCommand({
                TableName: TABLE,
                KeyConditionExpression: "userId = :u",
                ExpressionAttributeValues: { ":u": userId },
                ScanIndexForward: false,
            })
        );

        return {
            statusCode: 200,
            body: JSON.stringify({ items: res.Items ?? [] }),
        };
    } catch (e) {
        console.error(e);
        return {
            statusCode: 500,
            body: JSON.stringify({ message: "internal error" }),
        };
    }
};