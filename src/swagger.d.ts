declare const swaggerSpec: {
    readonly openapi: "3.0.3";
    readonly info: {
        readonly title: "Context Search API";
        readonly version: "1.0.0";
        readonly description: "API documentation for authentication, profiles, integrations, and email fetching.";
    };
    readonly servers: readonly [{
        readonly url: "http://localhost:3000";
        readonly description: "Local development server";
    }];
    readonly components: {
        readonly securitySchemes: {
            readonly cookieAuth: {
                readonly type: "apiKey";
                readonly in: "cookie";
                readonly name: "access_token";
            };
        };
        readonly schemas: {
            readonly RegisterRequest: {
                readonly type: "object";
                readonly required: readonly ["username", "email", "password"];
                readonly properties: {
                    readonly username: {
                        readonly type: "string";
                        readonly example: "john_doe";
                    };
                    readonly email: {
                        readonly type: "string";
                        readonly format: "email";
                        readonly example: "john@example.com";
                    };
                    readonly password: {
                        readonly type: "string";
                        readonly example: "Password123!";
                    };
                };
            };
            readonly LoginRequest: {
                readonly type: "object";
                readonly required: readonly ["email", "password"];
                readonly properties: {
                    readonly email: {
                        readonly type: "string";
                        readonly format: "email";
                        readonly example: "john@example.com";
                    };
                    readonly password: {
                        readonly type: "string";
                        readonly example: "Password123!";
                    };
                };
            };
            readonly CreateProfileRequest: {
                readonly type: "object";
                readonly required: readonly ["name"];
                readonly properties: {
                    readonly name: {
                        readonly type: "string";
                        readonly example: "Work";
                    };
                };
            };
            readonly GmailIntegrationRequest: {
                readonly type: "object";
                readonly required: readonly ["profileID", "accessToken", "refreshToken"];
                readonly properties: {
                    readonly profileID: {
                        readonly type: "string";
                        readonly format: "uuid";
                        readonly example: "550e8400-e29b-41d4-a716-446655440000";
                    };
                    readonly accessToken: {
                        readonly type: "string";
                        readonly example: "ya29.a0Af...";
                    };
                    readonly refreshToken: {
                        readonly type: "string";
                        readonly example: "1//0g...";
                    };
                };
            };
            readonly GmailEmail: {
                readonly type: "object";
                readonly properties: {
                    readonly id: {
                        readonly type: "string";
                        readonly example: "18c123abc";
                    };
                    readonly threadId: {
                        readonly type: "string";
                        readonly example: "18c123abc";
                    };
                    readonly snippet: {
                        readonly type: "string";
                        readonly example: "Hello, this is a sample message...";
                    };
                    readonly labelIds: {
                        readonly type: "array";
                        readonly items: {
                            readonly type: "string";
                        };
                        readonly example: readonly ["INBOX", "UNREAD"];
                    };
                    readonly internalDate: {
                        readonly type: "string";
                        readonly example: "1716112345678";
                    };
                    readonly from: {
                        readonly type: readonly ["string", "null"];
                        readonly example: "Jane Doe <jane@example.com>";
                    };
                    readonly subject: {
                        readonly type: readonly ["string", "null"];
                        readonly example: "Project update";
                    };
                    readonly date: {
                        readonly type: readonly ["string", "null"];
                        readonly example: "Thu, 22 May 2026 10:00:00 +0000";
                    };
                };
            };
            readonly SuccessResponse: {
                readonly type: "object";
                readonly properties: {
                    readonly status: {
                        readonly type: "string";
                        readonly example: "success";
                    };
                    readonly message: {
                        readonly type: "string";
                        readonly example: "Request succeeded";
                    };
                };
            };
            readonly ErrorResponse: {
                readonly type: "object";
                readonly properties: {
                    readonly status: {
                        readonly type: "string";
                        readonly example: "error";
                    };
                    readonly message: {
                        readonly type: "string";
                        readonly example: "Unauthorized";
                    };
                };
            };
        };
    };
    readonly security: readonly [{
        readonly cookieAuth: readonly [];
    }];
    readonly paths: {
        readonly "/api/authentication/register": {
            readonly post: {
                readonly tags: readonly ["Authentication"];
                readonly summary: "Register a user";
                readonly security: readonly [];
                readonly requestBody: {
                    readonly required: true;
                    readonly content: {
                        readonly "application/json": {
                            readonly schema: {
                                readonly $ref: "#/components/schemas/RegisterRequest";
                            };
                        };
                    };
                };
                readonly responses: {
                    readonly "201": {
                        readonly description: "User created";
                    };
                    readonly "400": {
                        readonly description: "Validation error";
                    };
                };
            };
        };
        readonly "/api/authentication/login": {
            readonly post: {
                readonly tags: readonly ["Authentication"];
                readonly summary: "Login a user";
                readonly security: readonly [];
                readonly requestBody: {
                    readonly required: true;
                    readonly content: {
                        readonly "application/json": {
                            readonly schema: {
                                readonly $ref: "#/components/schemas/LoginRequest";
                            };
                        };
                    };
                };
                readonly responses: {
                    readonly "200": {
                        readonly description: "Logged in";
                    };
                    readonly "401": {
                        readonly description: "Invalid credentials";
                    };
                };
            };
        };
        readonly "/api/authentication/logout": {
            readonly post: {
                readonly tags: readonly ["Authentication"];
                readonly summary: "Logout the current user";
                readonly responses: {
                    readonly "200": {
                        readonly description: "Logged out";
                    };
                };
            };
        };
        readonly "/api/authentication/me": {
            readonly get: {
                readonly tags: readonly ["Authentication"];
                readonly summary: "Get the current authenticated user";
                readonly responses: {
                    readonly "200": {
                        readonly description: "Current user";
                    };
                    readonly "401": {
                        readonly description: "Unauthorized";
                    };
                };
            };
        };
        readonly "/api/profile": {
            readonly post: {
                readonly tags: readonly ["Profile"];
                readonly summary: "Create a profile";
                readonly requestBody: {
                    readonly required: true;
                    readonly content: {
                        readonly "application/json": {
                            readonly schema: {
                                readonly $ref: "#/components/schemas/CreateProfileRequest";
                            };
                        };
                    };
                };
                readonly responses: {
                    readonly "201": {
                        readonly description: "Profile created";
                    };
                    readonly "401": {
                        readonly description: "Unauthorized";
                    };
                };
            };
        };
        readonly "/api/profile/{profile_id}/integration/google/connect": {
            readonly post: {
                readonly tags: readonly ["Integration"];
                readonly summary: "Get the Google OAuth URL for a profile";
                readonly parameters: readonly [{
                    readonly name: "profile_id";
                    readonly in: "path";
                    readonly required: true;
                    readonly schema: {
                        readonly type: "string";
                        readonly format: "uuid";
                    };
                }];
                readonly responses: {
                    readonly "200": {
                        readonly description: "OAuth URL generated";
                    };
                };
            };
        };
        readonly "/api/profile/{profile_id}/integration/google/get_gmail_integration": {
            readonly get: {
                readonly tags: readonly ["Integration"];
                readonly summary: "Get the stored Gmail integration for a profile";
                readonly parameters: readonly [{
                    readonly name: "profile_id";
                    readonly in: "path";
                    readonly required: true;
                    readonly schema: {
                        readonly type: "string";
                        readonly format: "uuid";
                    };
                }];
                readonly responses: {
                    readonly "200": {
                        readonly description: "Integration data returned";
                    };
                    readonly "404": {
                        readonly description: "Integration not found";
                    };
                };
            };
        };
        readonly "/api/profile/{profile_id}/integration/google/refresh_token": {
            readonly get: {
                readonly tags: readonly ["Integration"];
                readonly summary: "Refresh the Gmail access token for a profile";
                readonly parameters: readonly [{
                    readonly name: "profile_id";
                    readonly in: "path";
                    readonly required: true;
                    readonly schema: {
                        readonly type: "string";
                        readonly format: "uuid";
                    };
                }];
                readonly responses: {
                    readonly "200": {
                        readonly description: "Token refreshed";
                    };
                    readonly "404": {
                        readonly description: "Integration not found";
                    };
                };
            };
        };
        readonly "/api/integration/google/callback": {
            readonly get: {
                readonly tags: readonly ["Integration"];
                readonly summary: "Google OAuth callback";
                readonly parameters: readonly [{
                    readonly name: "code";
                    readonly in: "query";
                    readonly required: true;
                    readonly schema: {
                        readonly type: "string";
                    };
                }, {
                    readonly name: "state";
                    readonly in: "query";
                    readonly required: true;
                    readonly schema: {
                        readonly type: "string";
                        readonly format: "uuid";
                    };
                }];
                readonly responses: {
                    readonly "200": {
                        readonly description: "OAuth completed";
                    };
                };
            };
        };
        readonly "/api/integration/google/create_client": {
            readonly post: {
                readonly tags: readonly ["Integration"];
                readonly summary: "Create a Gmail client from stored tokens";
                readonly requestBody: {
                    readonly required: true;
                    readonly content: {
                        readonly "application/json": {
                            readonly schema: {
                                readonly $ref: "#/components/schemas/GmailIntegrationRequest";
                            };
                        };
                    };
                };
                readonly responses: {
                    readonly "200": {
                        readonly description: "Client created";
                    };
                };
            };
        };
        readonly "/api/communication/get_emails/{profile_id}": {
            readonly get: {
                readonly tags: readonly ["Communication"];
                readonly summary: "Fetch Gmail emails for a profile";
                readonly parameters: readonly [{
                    readonly name: "profile_id";
                    readonly in: "path";
                    readonly required: true;
                    readonly schema: {
                        readonly type: "string";
                        readonly format: "uuid";
                    };
                }, {
                    readonly name: "maxResults";
                    readonly in: "query";
                    readonly required: false;
                    readonly schema: {
                        readonly type: "integer";
                        readonly minimum: 1;
                        readonly default: 10;
                    };
                }];
                readonly responses: {
                    readonly "200": {
                        readonly description: "Emails fetched";
                        readonly content: {
                            readonly "application/json": {
                                readonly schema: {
                                    readonly type: "object";
                                    readonly properties: {
                                        readonly status: {
                                            readonly type: "string";
                                            readonly example: "success";
                                        };
                                        readonly message: {
                                            readonly type: "string";
                                            readonly example: "Emails fetched successfully";
                                        };
                                        readonly data: {
                                            readonly type: "object";
                                            readonly properties: {
                                                readonly emails: {
                                                    readonly type: "array";
                                                    readonly items: {
                                                        readonly $ref: "#/components/schemas/GmailEmail";
                                                    };
                                                };
                                            };
                                        };
                                    };
                                };
                            };
                        };
                    };
                };
            };
        };
    };
};
export default swaggerSpec;
//# sourceMappingURL=swagger.d.ts.map