import { Router } from "oak";
import { list, upload } from "../handlers/s3.ts";
const router = new Router({ prefix: "/api" });

router.get("/file/list", list);
router.post("/file", upload);

export default router;
