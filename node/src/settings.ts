import { readFile, writeFile } from "fs/promises";
import { join } from "path";

export type FolderSettings = {
  path: string;
  mode: string;
  enabled: boolean;
  shareCode?: string;
};

export abstract class PastaSettings {
  abstract getBaseDirectory(): string;
  abstract getFolder(id: string): Promise<FolderSettings | undefined>;
  abstract hasFolder(id: string): Promise<boolean>;
  abstract setFolder(id: string, folder: FolderSettings): Promise<void>;
  abstract getFolders(): Promise<Array<{ id: string } & FolderSettings>>;
  abstract save(): Promise<void>;
  abstract load(): Promise<void>;
}

export class PastaFileSettings extends PastaSettings {
  private folders: Map<string, FolderSettings> = new Map();

  constructor(
    private baseDirectoryPath: string,
    private configFilePath: string = "pasta.json",
  ) {
    super();
  }

  getBaseDirectory() {
    return this.baseDirectoryPath;
  }

  async hasFolder(id: string) {
    return this.folders.has(id);
  }

  async getFolder(id: string) {
    return this.folders.get(id);
  }

  async setFolder(id: string, folder: FolderSettings) {
    this.folders.set(id, folder);
    await this.save();
  }

  async getFolders() {
    // return Array.from(this.folders.entries());
    return Array.from(this.folders.entries()).map(([id, folder]) => ({
      id,
      ...folder,
    }));
  }

  async save() {
    const folders = Array.from(this.folders.entries()).map(
      ([id, { shareCode, ...folder }]) => [id, folder],
    );

    await writeFile(
      join(this.baseDirectoryPath, this.configFilePath),
      JSON.stringify(
        {
          folders: Object.fromEntries(folders),
        },
        undefined,
        2,
      ),
    );
  }

  async load() {
    try {
      const buffer = await readFile(
        join(this.baseDirectoryPath, this.configFilePath),
      );
      const json = JSON.parse(buffer.toString());

      this.folders = new Map(Object.entries(json.folders));
    } catch {
      this.folders = new Map();
    }
  }
}
