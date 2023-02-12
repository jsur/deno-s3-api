import { Router } from "oak";
import { getObjectUrl, list, upload } from "../handlers/s3.ts";
const router = new Router({ prefix: "/api" });

router.get("/file/list", list);
router.get("/file/url", getObjectUrl);
router.post("/file", upload);

export default router;
