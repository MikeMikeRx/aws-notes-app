# AWS Notes App

A minimal serverless Notes API built with AWS CDK, Lambda, API Gateway, and DynamoDB.

---

## Architecture

```
Client → API Gateway → Lambda → DynamoDB
                ↓
             Cognito (Auth)
```

- **AWS CDK (TypeScript)** — Infrastructure as Code
- **AWS Lambda (Node.js)** — business logic
- **API Gateway HTTP API** — public endpoint
- **DynamoDB** — notes storage
- **Amazon Cognito** — authentication (JWT)

---

## Project Structure

```
aws-notes-app/
├── infra/      # CDK infrastructure
└── backend/    # Lambda functions (TypeScript)
```

---

## Current Features

### API (CRUD)
- POST /notes — create note
- GET /notes — list notes
- PUT /notes/{noteId} — update note
- DELETE /notes/{noteId} — delete note

All endpoints are protected with JWT authentication (Cognito)

## Example Usage

Create Note
```bash
curl -X POST "$API_URL/notes" \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"content": "hello"}'
```

List Notes
```bash
curl "$API_URL/notes" \
  -H "Authorization: Bearer <TOKEN>"
```

---

## Authentication
- Managed by Amazon Cognito (self-signup enabled, email sign-in)
- JWT token required for all endpoints
- User identity extracted from token (`sub`) and used as DynamoDB partition key

## Deployment
```bash
cd infra
cdk deploy
```

Outputs:
```
ApiUrl
NotesTableName
```