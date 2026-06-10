import { Worker } from "bullmq";
import { redisConnection } from "./redis.client.js";
import { ChunkingService } from "../chunking/chunking.service.js";
import CommunicationRepository from "../communication/communication.repository.js";
import CommunicationService from "../communication/communication.service.js";
import IntegrationService from '../integration/integration.service.js';
import GoogleOAuthService from "../integration/google-oauth.service.js";
import IntegrationRepository from "../integration/integration.repository.js";

const communicationRepository = new CommunicationRepository();

const googleOAuthService = new GoogleOAuthService();
const integrationRepository = new IntegrationRepository();
const integrationService = new IntegrationService(googleOAuthService, integrationRepository);

const chunkingService = new ChunkingService(
  communicationRepository,
);
const communicationService = new CommunicationService(integrationService, googleOAuthService, communicationRepository, chunkingService, integrationRepository);

export const communicationWorker = new Worker(
  // The name of the queue to listen to
  "communication-queue",
  async (job) => {
    // Determine the type of job and process accordingly
    if (job.name === "chunk-communication") {
      const { communicationID } = job.data;

      if (!communicationID) {
        throw new Error("Communication ID is required for chunking");
      }

      await chunkingService.processCommunicationChunks(communicationID);
    }

    if(job.name === "sync-gmail") {
      const { profileID } = job.data;

      if (!profileID) {
        throw new Error("Profile ID is required for Gmail sync");
      }
      console.log("(Communication Worker) Starting Gmail sync for profile ID:", profileID);
      await communicationService.sync_gmail(profileID);
    }

    if(job.name === "sync-telegram") {
      const { profileID } = job.data;

      if (!profileID) {
        throw new Error("Profile ID is required for Telegram sync");
      }
      console.log("(Communication Worker) Starting Telegram sync for profile ID:", profileID);
      // await communicationService.sync_telegram(profileID);
    }
  },
  {
    connection: redisConnection,
    concurrency: Number(process.env.COMMUNICATION_WORKER_CONCURRENCY) || 5,
  },
);
