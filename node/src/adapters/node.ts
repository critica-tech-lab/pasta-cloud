import { ChildProcess, spawn } from "child_process";
import { chmod, mkdir, stat } from "fs/promises";
import { join } from "path";
import type { PastaSettings } from "../settings";
import { log } from "../logging";

const ETHERSYNC_FOLDER_MODE = 0o700;
const ETHERSYNC_JOIN_CODE_REGEX = /ethersync join ([\w-]+)/;

type JoinParams = {
  id: string;
  path: string;
  code: string;
};

type ShareParams = {
  id: string;
  path: string;
};

type StartParams = {
  id: string;
  joinCode?: string;
};

type StopParams = {
  id: string;
};

export type NodeInstance = {
  process: ChildProcess;
};

export class NodeAdapter {
  constructor(
    private instances: Map<string, NodeInstance>,
    private settings: PastaSettings,
    private onShareCode?: (id: string, shareCode: string) => void,
  ) {}

  async onStart({ id, joinCode }: StartParams) {
    const instance = this.instances.has(id);

    if (instance) {
      log.error("ethersync:", "unable to start, already running");
      return;
    }

    const folder = await this.settings.getFolder(id);

    if (!folder) {
      log.error("ethersync:", `unable to find config for "${id}"`);
      return;
    }

    const fullPath = join(this.settings.getBaseDirectory(), folder.path);

    await ensureDirectory(join(fullPath, ".ethersync"));

    const args = [folder.mode, "--directory", fullPath];

    if (folder.mode === "join" && joinCode) {
      args.push(joinCode);
    }

    log.debug("ethersync", "Starting ethersync binary with args:", ...args);

    const proc = spawn("ethersync", args);

    proc.stdout.on("data", (data: ArrayBuffer) => {
      const match = data.toString().match(ETHERSYNC_JOIN_CODE_REGEX);

      if (match && match[1] && this.onShareCode) {
        this.onShareCode(id, match[1]);
      }
    });

    proc.stderr.on("data", (data: ArrayBuffer) => {
      log.error(
        "onStart",
        `ethersync process error (${id}) >`,
        data.toString().trim(),
      );
    });

    this.instances.set(id, { process: proc });
  }

  async onStop({ id }: StopParams) {
    const instance = this.instances.get(id);

    if (instance) {
      instance.process.kill();
    }

    this.instances.delete(id);
  }

  async onJoin({ id, code }: JoinParams) {
    if (await this.settings.hasFolder(id)) {
      log.error("onJoin", "folder already exists");
      return;
    }

    this.settings.setFolder(id, {
      mode: "join",
      path: id,
      enabled: true,
    });

    await this.onStart({ id, joinCode: code });
  }

  async onShare({ id }: ShareParams) {
    if (await this.settings.hasFolder(id)) {
      log.error("onShare", "folder already exists");
      return;
    }

    await this.settings.setFolder(id, {
      mode: "share",
      path: id,
      enabled: true,
    });

    await this.onStart({ id });
  }

  async onList() {
    return await this.settings.getFolders();
  }
}

export async function ensureDirectory(path: string) {
  try {
    const stats = await stat(path);

    if (!stats.isDirectory()) {
      throw new Error("ensureDirectory: path is not a directory");
    }

    const hasRightPermissions = (stats.mode & 0o777) === ETHERSYNC_FOLDER_MODE;

    if (!hasRightPermissions) {
      await chmod(path, ETHERSYNC_FOLDER_MODE);
    }
  } catch {
    await mkdir(path, { recursive: true, mode: ETHERSYNC_FOLDER_MODE });
  }
}
