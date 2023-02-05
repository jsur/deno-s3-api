import { FormDataFile, RouterContext } from "oak";
import {
  S3Client,
  PutObjectCommand,
  ListObjectsCommand,
} from "aws/client-s3/mod.ts";
import { CONFIG } from "../util/config.ts";

const BUCKET = "deno-uploads";

console.log(CONFIG);

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
  const val = body.value;
  for await (const [name, value] of val.stream()) {
    const cmd = new PutObjectCommand({
      Body: await Deno.readFile((value as FormDataFile).filename!),
      Bucket: BUCKET,
      Key: name,
    });
    await client.send(cmd);
  }
  response.status = 200;
}

export async function list(ctx: RouterContext<string>) {
  const { response } = ctx;
  const cmd = new ListObjectsCommand({
    Bucket: BUCKET,
  });
  const { Contents } = await client.send(cmd);

  if (!Contents) return [];

  response.body = Contents.map((c) => ({
    key: c.Key,
    size: c.Size,
  }));
  response.status = 200;
}
