## Context Search Backend

Backend for a profile-based context search app with authentication, profile management, Gmail integration, and email fetching.

## What the app does

The app lets a user:

1. Register and log in.
2. Create a profile.
3. Connect that profile to Google Gmail.
4. Fetch emails for that profile.

The current implementation uses the profile ID as the main link between those steps.

## How the flow works

### 1. Authentication

First, the user signs up or logs in.

Important endpoints:

- `POST /api/authentication/register`
- `POST /api/authentication/login`
- `POST /api/authentication/logout`
- `GET /api/authentication/me`

After login, the backend stores the access token in a cookie named `access_token`.

### 2. Create a profile

Once authenticated, the user creates a profile.

- `POST /api/profile`

Example body:

```json
{
  "name": "Work"
}
```

The response gives you a `profile_id`. That ID is what the app uses for the rest of the flow.

### 3. Connect Gmail to the profile

From the profile page, the frontend starts the Google connect flow.

- `POST /api/profile/:profile_id/integration/google/connect`

Example:

```http
POST /api/profile/550e8400-e29b-41d4-a716-446655440000/integration/google/connect
```

This returns a Google OAuth URL. The user opens that URL and approves access to Gmail.

### 4. Google calls your callback

After approval, Google redirects back to the backend callback endpoint.

- `GET /api/integration/google/callback?code=...&state=...`

Notes:

- This callback route is public.
- `state` contains the `profile_id`.
- The backend exchanges the Google `code` for tokens and stores them as a Gmail integration for that profile.

### 5. Fetch emails for the profile

After the Gmail integration exists, the frontend can fetch emails for that profile.

- `GET /api/communication/get_emails/:profile_id`

Example:

```http
GET /api/communication/get_emails/550e8400-e29b-41d4-a716-446655440000
```

Optional query parameter:

- `maxResults` controls how many emails are returned.

Example:

```http
GET /api/communication/get_emails/550e8400-e29b-41d4-a716-446655440000?maxResults=10
```

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

The frontend already has the `profileId` after the profile is created or selected.

Typical UI flow:

1. User creates or selects a profile.
2. Frontend stores that profile ID in route state, route params, or component state.
3. The profile page uses that ID when calling connect Gmail or fetch emails.

So the profile ID is not something the email endpoint invents. It is carried through the UI and reused when needed.

## Main route groups

- `/api/authentication` - register, login, logout, current user
- `/api/profile` - create profiles and start Gmail connect
- `/api/integration` - Google OAuth callback and client creation
- `/api/communication` - fetch Gmail emails for a profile

## Run locally

Install dependencies and start the server:

```bash
pnpm install
pnpm dev
```

Build for production:

```bash
pnpm build
```

## Important behavior

- The Google callback route must stay public, because Google redirects there without your app cookie.
- The Gmail fetch route is protected and expects the user to already be authenticated.
- Email fetching only works after the profile has connected Gmail successfully.
- Fetched emails are cleaned before storage, so the database keeps plain text that is better for search and AI features.
