import { Router } from "express";
import { validateRequestBody, validateQueryParams } from "../validators";
import { authMiddleware } from "../middlewares/auth.middleware";
import {
  createLinkSchema,
  updateLinkSchema,
  listLinksQuerySchema,
  bulkDeleteSchema,
  addTagsSchema,
} from "../validators/links.validator";
import {
  listLinks,
  createLink,
  getLink,
  updateLink,
  deleteLink,
  bulkDeleteLinks,
  duplicateLink,
  deactivateLinks,
  addTagToLinks,
} from "../controllers/links.controller";

const router = Router();

router.use(authMiddleware);

router.get("/", validateQueryParams(listLinksQuerySchema), listLinks);
router.post("/", validateRequestBody(createLinkSchema), createLink);
router.post("/bulk-delete", validateRequestBody(bulkDeleteSchema), bulkDeleteLinks);
router.post("/deactivate", validateRequestBody(bulkDeleteSchema), deactivateLinks);
router.post("/add-tag", validateRequestBody(addTagsSchema), addTagToLinks);
router.get("/:slug", getLink);
router.put("/:slug", validateRequestBody(updateLinkSchema), updateLink);
router.delete("/:slug", deleteLink);
router.post("/:slug/duplicate", duplicateLink);

export default router;
