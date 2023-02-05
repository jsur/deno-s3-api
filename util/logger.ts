import * as log from "std/log/mod.ts";

await log.setup({
  handlers: {
    console: new log.handlers.ConsoleHandler("DEBUG", {
      formatter: "{datetime} {levelName} {msg}",
    }),
  },
  loggers: {
    default: {
      level: "DEBUG",
      handlers: ["console"],
    },
    info: {
      level: "INFO",
      handlers: ["console"],
    },
    error: {
      level: "ERROR",
      handlers: ["console"],
    },
  },
});

export const logger = log.getLogger();
