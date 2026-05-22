import express from "express";
import CommunicationService from "./communication.service.js";
declare class CommunicationController {
    private communicationService;
    constructor(communicationService: CommunicationService);
    get_emails: (req: express.Request, res: express.Response) => Promise<express.Response<any, Record<string, any>>>;
}
export default CommunicationController;
//# sourceMappingURL=communication.controller.d.ts.map