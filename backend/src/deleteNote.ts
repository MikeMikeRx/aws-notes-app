import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, DeleteCommand } from "@aws-sdk/lib-dynamodb";

const client = new DynamoDBClient({});
const doc = DynamoDBDocumentClient.from(client);

const TABLE = process.env.TABLE_NAME!;

export const handler = async (event: any) => {
    try {
        const noteId = event?.pathParameters?.noteId;
        const userId = "demo-user";

        if (!noteId) {
            return {
                statusCode: 400,
                body: JSON.stringify({ message: "noteId required" }),
            };
        }

        await doc.send(
            new DeleteCommand({
                TableName: TABLE,
                Key: {
                    userId,
                    noteId,
                },
            })
        );

        return {
            statusCode: 200,
            body: JSON.stringify({ message: "note deleted", noteId }),
        };
    } catch (error) {
        console.error(error);

        return {
            statusCode: 500,
            body: JSON.stringify({ message: "internal error" }),
        };
    }
};