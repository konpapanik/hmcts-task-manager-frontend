# HMCTS Task Manager Frontend

Server-rendered frontend for the HMCTS caseworker task manager.

## Features

- View all tasks
- Create a task
- View task details
- Update task status
- Delete a task
- Server-side form validation
- Basic GOV.UK-aligned accessibility and UX
- Route and unit tests

## Tech stack

- Node.js 20
- TypeScript
- Express
- Nunjucks
- GOV.UK Frontend
- Jest and Supertest
- Yarn 3

## Running locally

### Prerequisites

- Node.js `20.11.1`
- Corepack enabled so the repo can use Yarn 3
- Backend API running on `http://localhost:4000`

### Install

```bash
corepack enable
yarn install
```

### Start the backend

In the backend repo:

```bash
cd ~/hmcts-task-manager-fresh-backend
npm install
npm run prisma:migrate
npm run dev
```

### Start the frontend

In this repo:

```bash
cd ~/hmcts-task-manager-frontend
yarn start:dev
```

The frontend runs on `https://localhost:3100` in development.

The frontend connects to the backend using:

```ts
process.env.TASKS_API_URL || 'http://localhost:4000';
```

So if both apps are running locally with default settings, they connect automatically.

## Build commands

Build development assets:

```bash
yarn build
```

Build production assets:

```bash
yarn build:prod
```

Start the production server:

```bash
yarn start
```

## Test commands

Run all frontend tests:

```bash
yarn test
```

Run unit tests only:

```bash
yarn test:unit
```

Run route tests only:

```bash
yarn test:routes
```

Build the frontend bundle:

```bash
yarn build
```

## What the tests cover

### Unit tests

The unit tests cover:

- form validation for required fields
- title and description length checks
- due date validation
- conversion of browser `datetime-local` input into an ISO date-time string before sending it to the backend
- backend validation error mapping into form field errors

### Route tests

The route tests cover:

- rendering the home page
- rendering task details
- submitting task creation
- handling backend validation failures
- status updates
- deletion flows

## Frontend routes

- `GET /` shows the task list and create form
- `POST /tasks` creates a task
- `GET /tasks/:id` shows task details
- `POST /tasks/:id/status` updates task status
- `POST /tasks/:id/delete` deletes a task

## Validation and error handling

The frontend validates:

- required title
- maximum title length
- maximum description length
- valid status selection
- due date present, valid, and in the future

Before sending a create request, the frontend converts the `datetime-local` form value into a full ISO date-time string so it matches the backend API contract.

If backend validation fails, field errors are mapped back into the form so the user gets clear feedback.

## Troubleshooting

### Yarn or install commands fail

This repo uses Yarn 3, not npm, for frontend development.

Use:

```bash
yarn install
yarn start:dev
yarn test
yarn build
```

Do not use:

```bash
npm run dev
```

If Corepack is not enabled, run:

```bash
corepack enable
```

### The frontend starts but no tasks appear

Make sure the backend is running on `http://localhost:4000`.

In the backend repo:

```bash
cd ~/hmcts-task-manager-fresh-backend
npm run dev
```

If the backend is not running, the frontend pages can load but task data will fail.

### Creating a task fails with a due date error

The backend expects a full ISO date-time string.

The frontend now converts the browser date-time input before sending it, but if you test the API manually the due date must look like:

```json
{
  "dueDate": "2030-05-12T10:00:00.000Z"
}
```

A local browser-style value such as `2030-05-12T10:00` may be rejected by the backend.

### Tests pass but the build shows warnings

The webpack build may show Sass deprecation warnings related to the GOV.UK frontend import path and Sass loader API.

These warnings are currently non-blocking:

- they do not fail the build
- they do not stop the app from running
- they can be treated as technical debt for this exercise

### Frontend commands seem wrong or missing

The correct frontend scripts are:

```bash
yarn start:dev
yarn build
yarn build:prod
yarn test
yarn test:unit
yarn test:routes
```

If a command like `npm run dev` fails, that is expected for this repo.

### The frontend cannot connect to the backend

The frontend defaults to `http://localhost:4000` for the task API.

If you run the backend on a different port, set `TASKS_API_URL` to the correct backend URL before starting the frontend.

### macOS and Windows notes

The documented commands are written for macOS or Linux style shells.

The frontend works well on macOS. It can also be developed and tested on Windows, especially from PowerShell, but there are a few shell-specific differences:

- paths such as `~/hmcts-task-manager-frontend` may need to be replaced with your actual local path
- commands written with Unix shell syntax may need small adjustments in Windows shells
- `yarn start:dev`, `yarn test`, `yarn test:unit`, `yarn test:routes`, and `yarn build` are the safest cross-platform commands in this repo

The production scripts use POSIX-style environment variable syntax:

```bash
NODE_ENV=production ...
```

That works as written on macOS and Linux, but on Windows it may require PowerShell-specific syntax or a tool such as `cross-env`.

### Yarn resolution behaves unexpectedly

This repo uses Yarn 3 with `node-modules` linking to stay compatible with the existing webpack setup.

That is intentional and configured in `.yarnrc.yml`.

## Notes

- The repo uses Yarn 3 with `node-modules` linking to keep the starter setup compatible with the webpack toolchain.
- The UI uses GOV.UK components to keep the layout accessible and familiar without introducing unnecessary frontend complexity.
- The frontend is intentionally server-rendered to keep the solution simple and easy to explain in the technical test.
