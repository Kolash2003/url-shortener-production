import { Router } from "express";
import { validateRequestBody } from "../validators";
import { authMiddleware } from "../middlewares/auth.middleware";
import { createApiKeySchema } from "../validators/api-keys.validator";
import { listApiKeys, createApiKey, deleteApiKey } from "../controllers/api-keys.controller";

const router = Router();

router.use(authMiddleware);

router.get("/", listApiKeys);
router.post("/", validateRequestBody(createApiKeySchema), createApiKey);
router.delete("/:id", deleteApiKey);

export default router;
