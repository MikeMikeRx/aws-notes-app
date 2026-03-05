import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, PutCommand } from "@aws-sdk/lib-dynamodb";
import { randomUUID } from "crypto";

const client = new DynamoDBClient({});
const doc = DynamoDBDocumentClient.from(client);

const TABLE = "NotesTable";

export const handler = async (event:any) => {
    const body = JSON.parse(event.body || {});

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
};