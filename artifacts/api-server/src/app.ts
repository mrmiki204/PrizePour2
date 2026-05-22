import express, { type Express } from "express";
import cors from "cors";
import pinoHttp from "pino-http";
import session from "express-session";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { existsSync } from "node:fs";
import router from "./routes/index.js";
import { logger } from "./lib/logger.js";
import { WebhookHandlers } from "./webhookHandlers.js";

const app: Express = express();

// Stripe webhook MUST be registered before express.json() — needs raw Buffer body
app.post(
  "/api/stripe/webhook",
  express.raw({ type: "application/json" }),
  async (req, res): Promise<void> => {
    const signature = req.headers["stripe-signature"];
    if (!signature) {
      res.status(400).json({ error: "Missing stripe-signature" });
      return;
    }
    try {
      const sig = Array.isArray(signature) ? signature[0] : signature;
      await WebhookHandlers.processWebhook(req.body as Buffer, sig);
      res.status(200).json({ received: true });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Webhook error";
      logger.error({ err }, "Stripe webhook error");
      res.status(400).json({ error: message });
    }
  }
);

app.use(
  pinoHttp({
    logger,
    serializers: {
      req(req) {
        return {
          id: req.id,
          method: req.method,
          url: req.url?.split("?")[0],
        };
      },
      res(res) {
        return {
          statusCode: res.statusCode,
        };
      },
    },
  }),
);
app.use(cors({ origin: true, credentials: true }));

app.use(
  session({
    name: "pp.sid",
    secret: process.env["SESSION_SECRET"] ?? "prizepour-dev-secret",
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: process.env["NODE_ENV"] === "production",
      sameSite: process.env["NODE_ENV"] === "production" ? "none" : "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    },
  }),
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api", router);

// ── Production: serve built React frontend from whiskey-giveaway/dist/public ──
// In local Replit dev the Vite dev server is served separately by the workspace
// proxy, so we only enable this in production (e.g. Railway).
if (process.env["NODE_ENV"] === "production") {
  const here = path.dirname(fileURLToPath(import.meta.url));
  // Bundled server lives at artifacts/api-server/dist/index.mjs
  // Frontend build is at artifacts/whiskey-giveaway/dist/public
  const clientDist = path.resolve(
    here,
    "..",
    "..",
    "whiskey-giveaway",
    "dist",
    "public",
  );
  const indexHtml = path.join(clientDist, "index.html");

  if (existsSync(indexHtml)) {
    app.use(express.static(clientDist, { index: false, maxAge: "1h" }));

    // SPA fallback: any non-/api GET returns index.html so client-side
    // routes (wouter) work on hard refresh.
    app.get(/^(?!\/api\/).*/, (req, res, next) => {
      if (req.method !== "GET") return next();
      res.sendFile(indexHtml);
    });

    logger.info({ clientDist }, "Serving built frontend in production");
  } else {
    logger.warn(
      { clientDist },
      "Frontend build not found — run the whiskey-giveaway build before starting in production",
    );
  }
}

export default app;
