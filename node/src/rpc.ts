import { JSONRPCServer, type JSONRPCParams } from "json-rpc-2.0";
import { WebSocket } from "ws";
import { NodeAdapter, type NodeInstance } from "./adapters/node";
import { PastaSettings } from "./settings";

enum Method {
  Join = "join",
  Share = "share",
  Start = "start",
  Stop = "stop",
  List = "list",
}

export async function createJSONRPCServer(settings: PastaSettings) {
  const server = new JSONRPCServer<JSONRPCParams>();
  const processes = new Map<string, NodeInstance>();

  await settings.load();

  const onShareCode = async (id: string, code: string) => {
    const folder = await settings.getFolder(id);

    if (folder) {
      console.debug(`[pasta-cloud] Share code for ${id}: ${code}`);
      folder.shareCode = code;
    }
  };

  const adapter = new NodeAdapter(processes, settings, onShareCode);
  const folders = await settings.getFolders();

  for (const { id } of folders) {
    await adapter.onStart({ id });
  }

  server.addMethod(Method.Join, adapter.onJoin.bind(adapter));
  server.addMethod(Method.Share, adapter.onShare.bind(adapter));
  server.addMethod(Method.Start, adapter.onStart.bind(adapter));
  server.addMethod(Method.Stop, adapter.onStop.bind(adapter));
  server.addMethod(Method.List, adapter.onList.bind(adapter));

  return server;
}

export function setupConnection(ws: WebSocket, rpc: JSONRPCServer) {
  ws.on("message", async (raw) => {
    try {
      const message = JSON.parse(raw.toString());
      const result = await rpc.receive(message);

      if (result) {
        ws.send(JSON.stringify(result));
      }
    } catch (e) {
      console.warn("error when receiving JSON-RPC message", e);
    }
  });
}
