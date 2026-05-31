# Context Search Backend

This backend powers the context search app. It handles:

- user authentication
- profile creation
- Google Gmail connection
- fetching and cleaning emails for profiles

## 1. Clone the project

```bash
git clone <your-repo-url>
cd context_search
```

## 2. Create the `.env` file

Create a file named `.env` in the project root.

Use these keys exactly:

````env
# Application
BACKEND_PORT=8000
NODE_ENV=development


### What each env value means

- `BACKEND_PORT`: port for the Express server.
- `POSTGRES_USER`: database username used by Docker and the local connection string.
- `POSTGRES_PASSWORD`: database password.
- `POSTGRES_DB`: name of the database.
- `POSTGRES_PORT`: port exposed on your machine.
- `DATABASE_URL`: Prisma connection string used by the backend.
- `JWT_ACCESS_TOKEN_SECRET_KEY`: secret used to sign the login cookie token.
- `JWT_ACCESS_TOKEN_EXPIRES_IN`: token lifetime.
- `ACCESS_TOKEN_COOKIE_EXPIRES_IN`: cookie lifetime in milliseconds.
- `JWT_REFRESH_TOKEN_SECRET_KEY`: refresh-token secret.
- `HASH_SALT_ROUNDS`: bcrypt cost factor for password hashing.
- `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET`: OAuth credentials from Google Cloud.
- `GOOGLE_REDIRECT_URI`: the callback URL Google should redirect back to.

## 3. Start the database

You need a running PostgreSQL database before Prisma can connect.

1. Make sure Docker Desktop is open.
2. Put these values in your `.env` file:

```env
POSTGRES_USER=postgres
POSTGRES_PASSWORD=password
POSTGRES_DB=context_search_db
POSTGRES_PORT=5432
DATABASE_URL="postgresql://postgres:password@localhost:5432/context_search_db?schema=public"
````

3. Start only the database container:

```bash
docker compose up -d db
```

4. Check that it is running:

```bash
docker compose ps
```

5. If you want to see the logs:

```bash
docker compose logs -f db
```

## 4. Install dependencies

```bash
pnpm install
```

## 5. Prepare Prisma

Run Prisma generate and apply the migrations.

```bash
pnpm exec prisma generate
pnpm exec prisma migrate dev
```

If Prisma asks for a migration name, provide one that matches the schema change.

If the database is not running yet, stop here and fix the database first. Prisma cannot migrate without a live database connection.

## 6. Run the backend

Start the development server:

```bash
pnpm dev
```

The app will run on the port from `.env`, which is `8000` by default.

## 7. Verify the backend is working

Open or call these endpoints after the server starts:

- `POST /api/authentication/register`
- `POST /api/authentication/login`
- `POST /api/profile`
- `POST /api/profile/:profile_id/integration/google/connect`
- `GET /api/integration/google/callback?code=...&state=...`
- `GET /api/communication/get_emails/:profile_id`

Base URL:

```bash
http://localhost:8000
```

## 8. Recommended user flow

This is the exact flow a teammate should follow after the backend is running:

1. Register a user.
2. Log in.
3. Create a profile.
4. Use the returned `profile_id` to start the Google connect flow.
5. Approve Google access.
6. Let Google redirect to the callback endpoint.
7. Fetch emails for that profile.

## Route summary

## How email cleanup and storage work

When the backend fetches Gmail messages, it does two things:

1. It cleans the email body so the stored content is usable for search and AI.
2. It persists the email in an idempotent way (see Duplicate-safe storage below) and enqueues async chunking for embeddings/search.

### Email cleanup

The email body goes through a cleanup pipeline before saving:

- decode the Gmail message body
- convert HTML to plain text
- remove style, script, footer, navigation, and marketing boilerplate
- remove invisible characters and broken formatting
- normalize spacing and newlines
- build the snippet from the cleaned body, not from the raw Gmail preview

Implementation notes:

- The sanitizer lives in `src/communication/communication-email-sanitizer.ts` and uses `html-to-text` to produce deterministic plain text.
- It strips CSS/script artifacts, removes common footer/CTA boilerplate patterns, trims invisible unicode, and normalizes whitespace and newlines.
- The stored `snippet` is extracted from the cleaned body so previews and embeddings are based on the cleaned content.

### Duplicate-safe storage and updates

Communications are unique on the pair `integrationID + externalID` in the database (see `prisma/schema.prisma`).

- Previously the backend skipped creating a new row when a duplicate was found. It now refreshes the existing Communication: when the same message is fetched again we update the stored `sender`, `content`, `snippet`, `sent_at`, and `metadata` fields so improvements in the sanitizer are persisted.
- After the save/update, the service enqueues a chunking job so chunks/embeddings are rebuilt from the updated cleaned content.

Files to inspect:

- `src/communication/communication.repository.ts` — `save_email` now updates existing rows instead of silently skipping.
- `src/communication/communication.service.ts` — enqueues `chunk-communication` jobs after save.
- `src/message_broker/communication.worker.ts` and `src/chunking/chunking.service.ts` — worker and chunking flow that replace chunks atomically.

## Where the profile ID comes from on the frontend

- `POST /api/authentication/register`
- `POST /api/authentication/login`
- `POST /api/authentication/logout`
- `GET /api/authentication/me`

### Profile

- `POST /api/profile`

### Google integration

- `POST /api/profile/:profile_id/integration/google/connect`
- `GET /api/integration/google/callback?code=...&state=...`
- `POST /api/integration/google/create_client`

### Communication

- `GET /api/communication/get_emails/:profile_id`

## Important notes

- The Google callback route must stay public because Google calls it directly.
- The email fetch route is protected and requires the login cookie.
- The `profile_id` is created when the profile is created and then reused for Gmail connect and email fetching.
- The Gmail integration must exist before emails can be fetched.
- BullMQ is used for background processing and requires Redis. The worker is started by a side-effect import in `src/server.ts`.

## If something fails

- If login fails, check the JWT secrets and cookie settings.
- If Prisma fails, check `DATABASE_URL` and make sure Postgres is running.
- If Google connect fails, check the OAuth credentials and redirect URI.
- If email fetch returns unauthorized, make sure the user is logged in and the `access_token` cookie is present.
- If background chunking jobs do not run, check Redis is reachable and the worker process is started (the code imports the worker in `src/server.ts`).

## Running Redis for local development

BullMQ requires Redis. For local development add a `redis` service to `docker-compose.yml` or run Redis locally. Minimal example to add under `services`:

```yaml
redis:
	image: redis:7
	command: ["redis-server", "--appendonly", "yes"]
	ports:
		- "6379:6379"
	volumes:
		- redis-data:/data

volumes:
	redis-data:
```

Set these env vars in your `.env` for local development:

```
REDIS_HOST=redis
REDIS_PORT=6379
```

Start Redis with:

```bash
docker compose up -d redis
```

For production use a managed Redis and enable auth/tls as needed.

## Reprocessing existing Communications

Existing rows in the database are not automatically reprocessed. To apply the improved sanitizer and rebuild chunks for already-stored Communications you can either:

- Re-fetch messages for each profile (the `save_email` update will refresh rows and enqueue chunking), or
- Run a one-off reprocess script that iterates Communications and calls `chunkingService.processCommunication(communicationID)` for each row. (This can be added as a small Node script under `scripts/`.)

## Command summary

- The Google callback route must stay public, because Google redirects there without your app cookie.
- The Gmail fetch route is protected and expects the user to already be authenticated.
- Email fetching only works after the profile has connected Gmail successfully.
- Fetched emails are cleaned before storage; duplicates refresh stored content and trigger re-chunking.

Quick start (db + redis + dev server):

```bash
docker compose up -d db redis
pnpm install
pnpm exec prisma generate
pnpm exec prisma migrate dev
pnpm dev
```
