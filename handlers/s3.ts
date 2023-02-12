import { FormDataFile, RouterContext } from "oak";
import {
  S3Client,
  PutObjectCommand,
  ListObjectsCommand,
} from "aws/client-s3/mod.ts";
import { getSignedUrl } from "aws-presign";
import { CONFIG } from "../util/config.ts";
import { logger } from "../util/logger.ts";

const BUCKET = "deno-uploads";
const FILE_LIMIT = 30;

const client = new S3Client({
  region: CONFIG.AWS_REGION,
  credentials: {
    accessKeyId: CONFIG.AWS_ACCESS_KEY_ID,
    secretAccessKey: CONFIG.AWS_SECRET_ACCESS_KEY,
  },
});

export async function upload(ctx: RouterContext<string>) {
  const { request, response } = ctx;

  const body = request.body();

  if (body.type !== "form-data") {
    ctx.throw(400, "Wrong request type");
  }

  const cmd = new ListObjectsCommand({
    Bucket: BUCKET,
  });
  const { Contents } = await client.send(cmd);

  if (Contents && Contents?.length > FILE_LIMIT) {
    ctx.throw(400, `Daily file upload limit exceeded`);
  }

  const val = body.value;
  for await (const [name, value] of val.stream()) {
    const cmd = new PutObjectCommand({
      Body: await Deno.readFile((value as FormDataFile).filename!),
      Bucket: BUCKET,
      Key: name,
    });
    logger.info(`Uploading file: ${name}`);
    await client.send(cmd);
  }
  response.status = 200;
  response.body = { message: "ok" };
}

export async function list(ctx: RouterContext<string>) {
  const { response } = ctx;
  const cmd = new ListObjectsCommand({
    Bucket: BUCKET,
  });
  const { Contents } = await client.send(cmd);

  if (!Contents) {
    response.body = [];
    return;
  }

  response.body = Contents.map((c) => ({
    key: c.Key,
    size: c.Size,
  }));
}

export function getObjectUrl(ctx: RouterContext<string>) {
  const { request, response } = ctx;

  const key = request.url.searchParams.get("key");

  if (!key) {
    ctx.throw(400, "Request does not have key param");
  }

  const url = getSignedUrl({
    accessKeyId: CONFIG.AWS_ACCESS_KEY_ID,
    secretAccessKey: CONFIG.AWS_SECRET_ACCESS_KEY,
    bucket: BUCKET,
    key,
    region: CONFIG.AWS_REGION,
    expiresIn: 1800,
  });

  response.body = { url };
}
