import express from "express";
import IntegrationService from "./integration.service.js";
declare class IntegrationController {
    private integrationService;
    constructor(integrationService: IntegrationService);
    google_connect: (req: express.Request, res: express.Response) => Promise<express.Response<any, Record<string, any>> | undefined>;
    google_callback: (req: express.Request, res: express.Response) => Promise<express.Response<any, Record<string, any>> | undefined>;
    get_gmail_integration: (req: express.Request, res: express.Response) => Promise<express.Response<any, Record<string, any>> | undefined>;
    refresh_google_token: (req: express.Request, res: express.Response) => Promise<express.Response<any, Record<string, any>> | undefined>;
    create_gmail_client: (req: express.Request, res: express.Response) => Promise<express.Response<any, Record<string, any>> | undefined>;
}
export default IntegrationController;
//# sourceMappingURL=integration.controller.d.ts.map