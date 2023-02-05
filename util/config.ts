import { load } from "std/dotenv/mod.ts";
const env = await load();

export const CONFIG = {
  PORT: 8000,
  AWS_REGION: "eu-west-1",
  AWS_ACCESS_KEY_ID: env.AWS_ACCESS_KEY_ID,
  AWS_SECRET_ACCESS_KEY: env.AWS_SECRET_ACCESS_KEY,
};
