import z from "zod";
import GoogleOAuthService from "./google-oauth.service.js";
import IntegrationRepository from "./integration.repository.js";
import { Get_Gmail_Integration_Request, Store_Integration_Request } from "./integration.request.js";
class IntegrationService {
    googleOAuthservice;
    integrationRepository;
    constructor(googleOAuthservice, integrationRepository) {
        this.googleOAuthservice = googleOAuthservice;
        this.integrationRepository = integrationRepository;
        this.googleOAuthservice = googleOAuthservice;
        this.integrationRepository = integrationRepository;
    }
    connect_google = (profile_id) => {
        return this.googleOAuthservice.generateAuthUrl(profile_id);
    };
    handle_google_callback = async (code) => {
        return await this.googleOAuthservice.getToken(code);
    };
    get_gmail_integration = async (profile_id) => {
        if (!profile_id) {
            throw new Error("Profile ID is required");
        }
        return await this.integrationRepository.get_gmail_integration(profile_id);
    };
    create_gmail_client = async (integration) => {
        return await this.googleOAuthservice.create_gmail_client(integration);
    };
    refresh_google_token = async (refreshToken) => {
        if (!refreshToken) {
            throw new Error("Refresh token is required");
        }
        return await this.googleOAuthservice.refreshAccessToken(refreshToken);
    };
    store_integration_data = async (data) => {
        return await this.integrationRepository.store_integration_data(data);
    };
    update_integration_token = async (profile_id, data) => {
        return await this.integrationRepository.update_integration_token(profile_id, data);
    };
}
export default IntegrationService;
//# sourceMappingURL=integration.service.js.map