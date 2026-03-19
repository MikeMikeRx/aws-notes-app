import { Duration } from "aws-cdk-lib";
import * as cdk from "aws-cdk-lib";
import * as apigwv2 from "aws-cdk-lib/aws-apigatewayv2";
import * as integrations from "aws-cdk-lib/aws-apigatewayv2-integrations";
import * as dynamodb from "aws-cdk-lib/aws-dynamodb";
import * as lambda from "aws-cdk-lib/aws-lambda";
import { Construct } from "constructs";

export class InfraStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const table = new dynamodb.Table(this, "NotesTable", {
      tableName: "NotesTable",
      partitionKey: { name: "userId", type: dynamodb.AttributeType.STRING },
      sortKey: { name: "noteId", type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      pointInTimeRecovery: true,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    const createNoteFn = new lambda.Function(this, "CreateNoteFn", {
      runtime: lambda.Runtime.NODEJS_20_X,
      handler: "createNote.handler",
      code: lambda.Code.fromAsset("../backend/dist"),
      environment: {
        TABLE_NAME: table.tableName,
      },
      timeout: Duration.seconds(10),
    });

    const listNotesFn = new lambda.Function(this, "ListNotesFn", {
      runtime: lambda.Runtime.NODEJS_20_X,
      handler: "listNotes.handler",
      code: lambda.Code.fromAsset("../backend/dist"),
      environment: {
        TABLE_NAME: table.tableName,
      },
      timeout: Duration.seconds(10),
    });

    const delteNoteFn = new lambda.Function(this, "DeleteNoteFn", {
      runtime: lambda.Runtime.NODEJS_20_X,
      handler: "deleteNote.handler",
      code: lambda.Code.fromAsset("../backend/dist"),
      environment: {
        TABLE_NAME: table.tableName,
      },
      timeout: Duration.seconds(10),
    });

    const updateNoteFn = new lambda.Function(this, "UpdateNoteFn", {
      runtime: lambda.Runtime.NODEJS_20_X,
      handler: "updateNote.handler",
      code: lambda.Code.fromAsset("../backend/dist"),
      environment: {
        TABLE_NAME: table.tableName,
      },
      timeout: Duration.seconds(10),
    });

    table.grantWriteData(createNoteFn);
    table.grantReadData(listNotesFn);
    table.grantWriteData(delteNoteFn);
    table.grantWriteData(updateNoteFn);

    const httpApi = new apigwv2.HttpApi(this, "NoteApi", {
      corsPreflight: {
        allowHeaders: ["Authorization", "Content-Type"],
        allowMethods: [
          apigwv2.CorsHttpMethod.POST,
          apigwv2.CorsHttpMethod.GET,
          apigwv2.CorsHttpMethod.DELETE,
          apigwv2.CorsHttpMethod.PUT,
        ],
        allowOrigins: ["*"]
      },
    });

    httpApi.addRoutes({
      path: "/notes",
      methods: [apigwv2.HttpMethod.POST],
      integration: new integrations.HttpLambdaIntegration("CreateNoteIntegration", createNoteFn),
    });

    httpApi.addRoutes({
      path: "/notes",
      methods: [apigwv2.HttpMethod.GET],
      integration: new integrations.HttpLambdaIntegration("ListNotesIntegration", listNotesFn),
    });

    httpApi.addRoutes({
      path: "/notes/{noteId}",
      methods: [apigwv2.HttpMethod.DELETE],
      integration: new integrations.HttpLambdaIntegration("DeleteNoteIntegration", delteNoteFn),
    })

    httpApi.addRoutes({
      path: "/notes/{noteId}",
      methods: [apigwv2.HttpMethod.PUT],
      integration: new integrations.HttpLambdaIntegration("UpdateNoteIntegration", updateNoteFn),
    });

    new cdk.CfnOutput(this, "NotesTableName", { value: table.tableName });
    new cdk.CfnOutput(this, "ApiUrl", { value: httpApi.apiEndpoint });
  }
}