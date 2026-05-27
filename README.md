# Context Search Backend

This backend powers the context search app. It handles:

- user authentication
- profile creation
- Google Gmail connection
- fetching emails for a selected profile

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
2. It saves the email in the database only if that message has not already been stored for the same integration.

### Email cleanup

The email body goes through a cleanup pipeline before saving:

- decode the Gmail message body
- convert HTML to plain text
- remove style, script, footer, navigation, and marketing boilerplate
- remove invisible characters and broken formatting
- normalize spacing and newlines
- build the snippet from the cleaned body, not from the raw Gmail preview

This keeps the stored content focused on the real message instead of ads, footers, or template noise.

### Duplicate-safe storage

Emails are stored in `Communication` with a unique rule on:

- `integrationID`
- `externalID`

That means the same Gmail message will not be inserted twice for the same integration. Before creating a new record, the backend checks whether that message already exists and skips it if it does.

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

## If something fails

- If login fails, check the JWT secrets and cookie settings.
- If Prisma fails, check `DATABASE_URL` and make sure Postgres is running.
- If Google connect fails, check the OAuth credentials and redirect URI.
- If email fetch returns unauthorized, make sure the user is logged in and the `access_token` cookie is present.

##  command summary

- The Google callback route must stay public, because Google redirects there without your app cookie.
- The Gmail fetch route is protected and expects the user to already be authenticated.
- Email fetching only works after the profile has connected Gmail successfully.
- Fetched emails are cleaned before storage, so the database keeps plain text that is better for search and AI features.
```bash
docker compose up -d db
pnpm install
pnpm exec prisma generate
pnpm exec prisma migrate dev
pnpm dev
```
