# AWS Notes App

> 🚧 Work in progress — project is actively evolving.

A minimal serverless Notes API built with AWS CDK, Lambda, API Gateway, and DynamoDB.

---

## Architecture

```
Client → API Gateway → Lambda → DynamoDB
```

- **AWS CDK (TypeScript)** — Infrastructure as Code
- **AWS Lambda (Node.js)** — business logic
- **API Gateway HTTP API** — public endpoint
- **DynamoDB** — notes storage

---

## Project Structure

```
aws-notes-app/
├── infra/      # CDK infrastructure
└── backend/    # Lambda functions (TypeScript)
```

---

## Current Features

- `POST /notes` — create a note

```bash
curl -X POST "$API_URL/notes" \
  -H "Content-Type: application/json" \
  -d '{"content": "hello"}'
```

---

## Planned

- List, update, delete notes
- Authentication (Cognito)
- Frontend client
