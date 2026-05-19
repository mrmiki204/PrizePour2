import { Router, type IRouter } from "express";
import healthRouter from "./health.js";
import entriesRouter from "./entries.js";
import stripeRouter from "./stripe.js";
import rewardsRouter from "./rewards.js";
import giveawaysRouter from "./giveaways.js";
import adminRouter from "./admin.js";

const router: IRouter = Router();

router.use(healthRouter);
router.use(adminRouter);
router.use(entriesRouter);
router.use(stripeRouter);
router.use(rewardsRouter);
router.use(giveawaysRouter);

export default router;
