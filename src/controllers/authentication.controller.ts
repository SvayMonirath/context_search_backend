import express from "express";
import z from "zod";

import { Register_Request } from "../dtos/authentication.request.js";
import { AuthenticationService } from "../services/authentication.service.js";

export class AuthenticationController {
  constructor(private authentication_service: AuthenticationService) {
    this.authentication_service = authentication_service;
  }

  register = async (req: express.Request, res: express.Response) => {
    try {
      const userData: z.infer<typeof Register_Request> = Register_Request.parse(req.body);
      const result = await this.authentication_service.register(userData);

      res.status(201).json({
        status: "success",
        message: "User registered successfully",
        data: result
      });

    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid request data", errors: error});
      } else {
        res.status(500).json({ message: "Error registering user", error: error });
      }
    }
  }

}
