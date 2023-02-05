import { Router } from "oak";
import { list, upload } from "../handlers/s3.ts";
const router = new Router({ prefix: "/api" });

router.get("/img/list", list);
router.post("/img", upload);

export default router;
