import { createServer } from "node:http";
import { WebSocketServer } from "ws";
import { createJSONRPCServer, setupConnection } from "./rpc";
import { PastaFileSettings } from "./settings";
import { log } from "./logging";

const RPC_SERVER_PATH = process.env.RPC_SERVER_PATH ?? "/rpc";

export async function startPastaServer(baseDir: string, port: number) {
  const http = createServer();
  const settings = new PastaFileSettings(baseDir);
  const rpc = await createJSONRPCServer(settings);
  const wss = new WebSocketServer({ server: http, path: RPC_SERVER_PATH });

  wss.on("connection", (ws) => setupConnection(ws, rpc));

  log.debug("server", "Using base directory:", baseDir);

  http.listen(port, "0.0.0.0", () =>
    log.debug(
      "server",
      `JSON-RPC server listening on ws://localhost:${port}${RPC_SERVER_PATH}`,
    ),
  );
}
