import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, UpdateCommand } from "@aws-sdk/lib-dynamodb";
import { APIGatewayProxyEventV2WithJWTAuthorizer } from "aws-lambda";

const client = new DynamoDBClient({});
const doc = DynamoDBDocumentClient.from(client);

const TABLE = process.env.TABLE_NAME!;

export const handler = async (event: APIGatewayProxyEventV2WithJWTAuthorizer) => {
    try {
        const noteId = event?.pathParameters?.noteId;
        const userId = event.requestContext.authorizer.jwt.claims.sub;
        const body = JSON.parse(event?.body || "{}");

        if (!noteId) {
            return {
                statusCode: 400,
                body: JSON.stringify({ message: "noteId required" }),
            };
        }

        if (!body.content) {
            return {
                statusCode: 400,
                body: JSON.stringify({ message: "content required" }),
            };
        }

        await doc.send(
            new UpdateCommand({
                TableName: TABLE,
                Key: {
                    userId,
                    noteId,
                },
                UpdateExpression: "SET content = :content, updatedAt = :updatedAt",
                ExpressionAttributeValues: {
                    ":content": body.content,
                    ":updatedAt": new Date().toISOString(),
                },
                ConditionExpression: "attribute_exists(userId) AND attribute_exists(noteId)",
                ReturnValues: "ALL_NEW",
            })
        );

        return {
            statusCode: 200,
            body: JSON.stringify({
                message: "note updated",
                noteId,
            }),
        };
    } catch (error: any) {
        console.error(error);

        if( error?.name === "ConditionalCheckFailedException") {
            return {
                statusCode: 404,
                body: JSON.stringify({ message: "note not found" }),
            };
        }

        return {
            statusCode: 500,
            body: JSON.stringify({ message: "internal error" }),
        };
    }
};