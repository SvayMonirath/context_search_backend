import express from "express";
import { AuthenticationService } from "./authentication.service.js";
export declare class AuthenticationController {
    private authentication_service;
    constructor(authentication_service: AuthenticationService);
    register: (req: express.Request, res: express.Response) => Promise<void>;
    login: (req: express.Request, res: express.Response) => Promise<void>;
    logout: (req: express.Request, res: express.Response) => Promise<void>;
    get_current_user: (req: express.Request, res: express.Response) => Promise<void>;
}
//# sourceMappingURL=authentication.controller.d.ts.map