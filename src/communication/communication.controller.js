import express from "express";
import CommunicationService from "./communication.service.js";
class CommunicationController {
    communicationService;
    constructor(communicationService) {
        this.communicationService = communicationService;
        this.communicationService = communicationService;
    }
    get_emails = async (req, res) => {
        try {
            const profile_id = typeof req.params.profile_id === "string" ? req.params.profile_id : "";
            if (!profile_id) {
                return res.status(400).json({
                    status: "error",
                    message: "Profile ID is required",
                });
            }
            const maxResults = req.query.maxResults ? Number(req.query.maxResults) : 10;
            const emails = await this.communicationService.fetch_emails(profile_id, maxResults);
            return res.status(200).json({
                status: "success",
                message: "Emails fetched successfully",
                data: {
                    emails,
                },
            });
        }
        catch (error) {
            return res.status(500).json({
                status: "error",
                message: error.message,
            });
        }
    };
}
export default CommunicationController;
//# sourceMappingURL=communication.controller.js.map