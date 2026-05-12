import { Router, type IRouter } from "express";
import healthRouter from "./health.js";
import entriesRouter from "./entries.js";
import stripeRouter from "./stripe.js";

const router: IRouter = Router();

router.use(healthRouter);
router.use(entriesRouter);
router.use(stripeRouter);

export default router;
