import express from "express";
import z from "zod";

import { Login_Request, Register_Request } from "./authentication.request.js";
import { AuthenticationService } from "./authentication.service.js";

export class AuthenticationController
{
  constructor(private authentication_service: AuthenticationService) {
    this.authentication_service = authentication_service;
  }

  register = async (req: express.Request, res: express.Response) => {
    try {
      const userData: z.infer<typeof Register_Request> = Register_Request.parse(
        req.body,
      );
      await this.authentication_service.register(userData);

      res.status(201).json({
        status: "success",
        message: "User registered successfully",
      });
    } catch (error) {
      res.status(400).json({
        status: "error",
        message:
          error instanceof Error
            ? error.message
            : "An error occurred during registration",
      });
    }
  };

  login = async (req: express.Request, res: express.Response) => {
    try {
      const userData: z.infer<typeof Login_Request> = Login_Request.parse(
        req.body,
      );
      const { user, access_token } =
        await this.authentication_service.login(userData);

      res.cookie("access_token", access_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: Number(process.env.ACCESS_TOKEN_COOKIE_EXPIRES_IN || "3600000"),
      });

      res.status(200).json({
        status: "success",
        message: "User logged in successfully",
        data: {
          access_token: access_token,
        },
      });
    } catch (error) {
      res.status(400).json({
        status: "error",
        message:
          error instanceof Error
            ? error.message
            : "An error occurred during login",
      });
    }
  };

  logout = async (req: express.Request, res: express.Response) => {
    res.clearCookie("access_token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    });

    res.status(200).json({
      status: "success",
      message: "User logged out successfully",
    });
  };

  get_current_user = async (req: express.Request, res: express.Response) => {
    try {
      const user = req.user;

      res.status(200).json({
        status: "success",
        message: "Current user fetched successfully",
        data: {
          user,
        },
      });
    } catch (error) {
      res.status(500).json({
        status: "error",
        message: "An error occurred while fetching current user",
      });
    }
  }

}
