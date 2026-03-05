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

    table.grantWriteData(createNoteFn);

    const httpApi = new apigwv2.HttpApi(this, "NoteApi", {
      corsPreflight: {
        allowHeaders: ["Authorization", "Content-Type"],
        allowMethods: [apigwv2.CorsHttpMethod.POST],
        allowOrigins: ["*"]
      },
    });

    httpApi.addRoutes({
      path: "/notes",
      methods: [apigwv2.HttpMethod.POST],
      integration: new integrations.HttpLambdaIntegration("CreateNoteIntegration", createNoteFn),
    });

    new cdk.CfnOutput(this, "NotesTableName", { value: table.tableName });
    new cdk.CfnOutput(this, "ApiUrl", { value: httpApi.apiEndpoint });
  }
}