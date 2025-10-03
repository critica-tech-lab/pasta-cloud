# Pasta Cloud

Cloud services for Pasta

> [!IMPORTANT]
> Pasta Cloud is in an early & experimental stage. Use at your own risk and do not store critical data.

### Try it

Docker images are available through [GitHub container registry](ghcr.io/critica-tech-lab/pasta-cloud)

```
mkdir ~/pasta
docker run -v ~/pasta:/pasta -p 8000:8000 ghcr.io/critica-tech-lab/pasta-cloud
```

### Design

Pasta Cloud exposes a JSON-RPC API to manage Ethersync instances (inspired by [Ethersync Client](https://ethersync.github.io/ethersync/editor-plugin-dev-guide.html) API)

The following methods are supported:

- `share` - Share a folder through the [iroh network](https://www.iroh.computer/) using Ethersync.
- `join` - Join a remote folder.
- `start` - Start an Ethersync daemon for a folder (mode: join or share).
- `stop` - Stop sharing or joining a folder.
- `list` - Return a list of folders managed by Pasta Cloud.

The JSON-RPC API is served at `https://<PASTA-HOST>/rpc`
