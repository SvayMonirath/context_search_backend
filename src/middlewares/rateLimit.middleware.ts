import rateLimit, { ipKeyGenerator } from "express-rate-limit";

export const createChatLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 5, // limit each IP to 5 requests per windowMs
  keyGenerator: (req) => {
    const userId = req.user ? req.user.id : "anonymous";
    return userId || ipKeyGenerator(req.ip);
  },
  message: {
    status: "error",
    message: "Too many chat creation requests from this IP, please try again after a minute",
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

export const searchLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10, // limit each IP to 10 requests per windowMs
  keyGenerator: (req) => {
    // Use a combination of IP address and user ID (if available) as the key
    const userId = req.user ? req.user.id : "anonymous";
    return userId || ipKeyGenerator(req.ip);
  },
  message: {
    status: "error",
    message: "Too many search requests, please try again after a minute",
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
})
