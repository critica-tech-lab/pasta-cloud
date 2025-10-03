import { lstatSync } from "node:fs";
import yargs from "yargs";
import { hideBin } from "yargs/helpers";
import { startPastaServer } from "./server";
import { log } from "./logging";

function shutdown() {
  log.debug("shutdown", "Stopping Pasta Cloud server...");
  process.exit(0);
}

process.on("SIGTERM", shutdown);
process.on("SIGINT", shutdown);

yargs(hideBin(process.argv))
  .scriptName("pasta-cloud")
  .usage("$0 <command> [options]")
  .command(
    "start",
    "Start Pasta Cloud server",
    (y) =>
      y
        .option("directory", {
          alias: "d",
          type: "string",
          coerce: (directory) => {
            if (!directory || directory.length === 0) {
              throw new Error("Directory (--directory) must not be empty");
            }

            if (!lstatSync(directory).isDirectory()) {
              throw new Error(`Not a directory: ${directory}`);
            }

            return directory;
          },
          describe: "Base directory for Pasta storage",
        })
        .demandOption("directory", "Directory (--directory) must not be empty")
        .option("port", {
          alias: "p",
          type: "number",
          default: 8080,
          describe: "Port to listen on",
        }),

    async (argv) => {
      await startPastaServer(argv.directory, argv.port);
    },
  )
  .strict()
  .demandCommand(1, "")
  .help()
  .parse();
