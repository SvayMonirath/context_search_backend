const swaggerSpec = {
  openapi: "3.0.3",
  info: {
    title: "Context Search API",
    version: "1.0.0",
    description:
      "API documentation for authentication, profiles, integrations, and email fetching.",
  },
  servers: [
    {
      url: "http://localhost:3000",
      description: "Local development server",
    },
  ],
  components: {
    securitySchemes: {
      cookieAuth: {
        type: "apiKey",
        in: "cookie",
        name: "access_token",
      },
    },
    schemas: {
      RegisterRequest: {
        type: "object",
        required: ["username", "email", "password"],
        properties: {
          username: { type: "string", example: "john_doe" },
          email: {
            type: "string",
            format: "email",
            example: "john@example.com",
          },
          password: { type: "string", example: "Password123!" },
        },
      },
      LoginRequest: {
        type: "object",
        required: ["email", "password"],
        properties: {
          email: {
            type: "string",
            format: "email",
            example: "john@example.com",
          },
          password: { type: "string", example: "Password123!" },
        },
      },
      CreateProfileRequest: {
        type: "object",
        required: ["name"],
        properties: {
          name: { type: "string", example: "Work" },
        },
      },
      GmailIntegrationRequest: {
        type: "object",
        required: ["profileID", "accessToken", "refreshToken"],
        properties: {
          profileID: {
            type: "string",
            format: "uuid",
            example: "550e8400-e29b-41d4-a716-446655440000",
          },
          accessToken: { type: "string", example: "ya29.a0Af..." },
          refreshToken: { type: "string", example: "1//0g..." },
        },
      },
      GmailEmail: {
        type: "object",
        properties: {
          id: { type: "string", example: "18c123abc" },
          threadId: { type: "string", example: "18c123abc" },
          snippet: {
            type: "string",
            example: "Hello, this is a sample message...",
          },
          labelIds: {
            type: "array",
            items: { type: "string" },
            example: ["INBOX", "UNREAD"],
          },
          internalDate: { type: "string", example: "1716112345678" },
          from: {
            type: ["string", "null"],
            example: "Jane Doe <jane@example.com>",
          },
          subject: { type: ["string", "null"], example: "Project update" },
          date: {
            type: ["string", "null"],
            example: "Thu, 22 May 2026 10:00:00 +0000",
          },
        },
      },
      SuccessResponse: {
        type: "object",
        properties: {
          status: { type: "string", example: "success" },
          message: { type: "string", example: "Request succeeded" },
        },
      },
      ErrorResponse: {
        type: "object",
        properties: {
          status: { type: "string", example: "error" },
          message: { type: "string", example: "Unauthorized" },
        },
      },
    },
  },
  security: [{ cookieAuth: [] }],
  paths: {
    "/api/authentication/register": {
      post: {
        tags: ["Authentication"],
        summary: "Register a user",
        security: [],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/RegisterRequest" },
            },
          },
        },
        responses: {
          "201": { description: "User created" },
          "400": { description: "Validation error" },
        },
      },
    },
    "/api/authentication/login": {
      post: {
        tags: ["Authentication"],
        summary: "Login a user",
        security: [],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/LoginRequest" },
            },
          },
        },
        responses: {
          "200": { description: "Logged in" },
          "401": { description: "Invalid credentials" },
        },
      },
    },
    "/api/authentication/logout": {
      post: {
        tags: ["Authentication"],
        summary: "Logout the current user",
        responses: {
          "200": { description: "Logged out" },
        },
      },
    },
    "/api/authentication/me": {
      get: {
        tags: ["Authentication"],
        summary: "Get the current authenticated user",
        responses: {
          "200": { description: "Current user" },
          "401": { description: "Unauthorized" },
        },
      },
    },
    "/api/profile": {
      post: {
        tags: ["Profile"],
        summary: "Create a profile",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/CreateProfileRequest" },
            },
          },
        },
        responses: {
          "201": { description: "Profile created" },
          "401": { description: "Unauthorized" },
        },
      },
    },
    "/api/profile/{profile_id}/integration/google/connect": {
      post: {
        tags: ["Integration"],
        summary: "Get the Google OAuth URL for a profile",
        parameters: [
          {
            name: "profile_id",
            in: "path",
            required: true,
            schema: { type: "string", format: "uuid" },
          },
        ],
        responses: {
          "200": { description: "OAuth URL generated" },
        },
      },
    },
    "/api/profile/{profile_id}/integration/google/get_gmail_integration": {
      get: {
        tags: ["Integration"],
        summary: "Get the stored Gmail integration for a profile",
        parameters: [
          {
            name: "profile_id",
            in: "path",
            required: true,
            schema: { type: "string", format: "uuid" },
          },
        ],
        responses: {
          "200": { description: "Integration data returned" },
          "404": { description: "Integration not found" },
        },
      },
    },
    "/api/profile/{profile_id}/integration/google/refresh_token": {
      get: {
        tags: ["Integration"],
        summary: "Refresh the Gmail access token for a profile",
        parameters: [
          {
            name: "profile_id",
            in: "path",
            required: true,
            schema: { type: "string", format: "uuid" },
          },
        ],
        responses: {
          "200": { description: "Token refreshed" },
          "404": { description: "Integration not found" },
        },
      },
    },
    "/api/integration/google/callback": {
      get: {
        tags: ["Integration"],
        summary: "Google OAuth callback",
        parameters: [
          {
            name: "code",
            in: "query",
            required: true,
            schema: { type: "string" },
          },
          {
            name: "state",
            in: "query",
            required: true,
            schema: { type: "string", format: "uuid" },
          },
        ],
        responses: {
          "200": { description: "OAuth completed" },
        },
      },
    },
    "/api/integration/google/create_client": {
      post: {
        tags: ["Integration"],
        summary: "Create a Gmail client from stored tokens",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/GmailIntegrationRequest" },
            },
          },
        },
        responses: {
          "200": { description: "Client created" },
        },
      },
    },
    "/api/communication/get_emails/{profile_id}": {
      get: {
        tags: ["Communication"],
        summary: "Fetch Gmail emails for a profile",
        parameters: [
          {
            name: "profile_id",
            in: "path",
            required: true,
            schema: { type: "string", format: "uuid" },
          },
          {
            name: "maxResults",
            in: "query",
            required: false,
            schema: { type: "integer", minimum: 1, default: 10 },
          },
        ],
        responses: {
          "200": {
            description: "Emails fetched",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    status: { type: "string", example: "success" },
                    message: {
                      type: "string",
                      example: "Emails fetched successfully",
                    },
                    data: {
                      type: "object",
                      properties: {
                        emails: {
                          type: "array",
                          items: { $ref: "#/components/schemas/GmailEmail" },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  },
} as const;

export default swaggerSpec;
