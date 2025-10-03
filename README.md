# Pasta Cloud

Pasta Cloud is a small service that lets you run and manage [Ethersync](https://ethersync.github.io/) folders from one place. It provides a JSON-RPC API so other tools can automate common tasks such as sharing a folder, joining an existing share, or starting and stopping local daemons.

> [^IMPORTANT]
> This project is experimental and still changing quickly. It is not ready for production use. Expect breaking changes, limited documentation, and rough edges. Do not rely on it for critical data.

## Run it with Docker

Pre-built images are published to the [GitHub Container Registry](https://ghcr.io/critica-tech-lab/pasta-cloud). The snippet below starts Pasta Cloud locally, storing folder contents in `~/pasta`:

```bash
mkdir -p ~/pasta

docker run \
  -v ~/pasta:/pasta \
  -p 8000:8000 \
  ghcr.io/critica-tech-lab/pasta-cloud
```

The API will be available at `http://localhost:8000/rpc`.

## Design

Pasta Cloud exposes a JSON-RPC endpoint (inspired by [Ethersync Client API](https://ethersync.github.io/ethersync/editor-plugin-dev-guide.html)).

The following methods are available:

- `share`: share a local folder through the [iroh network](https://www.iroh.computer/) using Ethersync.
- `join`: connect to a folder shared by another peer.
- `start`: launch an Ethersync daemon for a folder.
- `stop`: stop Ethersync daemon for a folder.
- `list`: return a list of folders managed by Pasta Cloud.
