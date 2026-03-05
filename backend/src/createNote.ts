import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, PutCommand } from "@aws-sdk/lib-dynamodb";
import { randomUUID } from "crypto";

const client = new DynamoDBClient({});
const doc = DynamoDBDocumentClient.from(client);

const TABLE = process.env.TABLE_NAME!;

export const handler = async (event:any) => {
    try {
        const body = JSON.parse(event.body || {});

        if (!body.content) {
            return { statusCode: 400, body: JSON.stringify({ message: "content rquired" }) };
        }

        const note = {
            userId: "demo-user",
            noteId: randomUUID(),
            content: body.content,
            createdAt: new Date().toISOString()
        };

        await doc.send(
            new PutCommand({
                TableName: TABLE,
                Item: note
            })
        );

        return {
            statusCode: 200,
            body: JSON.stringify(note)
        };
    } catch (error) {
        console.error(error);

        return {
            statusCode: 500,
            body: JSON.stringify({ message: "internal error" })
        };
    }
};