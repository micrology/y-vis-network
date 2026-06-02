# y-vis-network

A demonstration of integrating [Yjs](https://github.com/yjs/yjs) (a CRDT library) with [vis-network](https://visjs.github.io/vis-network/) for real-time collaborative network graph editing. Multiple clients can simultaneously add, edit, and delete nodes and edges, with changes automatically synchronised via a WebSocket server.

## How it works

The app uses a bidirectional sync pattern between local vis-network DataSets and Yjs shared maps:

1. **Local → Remote**: `nodes.on('*')` and `edges.on('*')` listeners detect local changes and update `yNodesMap` / `yEdgesMap`.
2. **Remote → Local**: `yNodesMap.observe()` and `yEdgesMap.observe()` detect remote changes and update the local DataSets.

Each node and edge is tagged with a `clientID` to prevent feedback loops — only changes from other clients trigger local updates.

A **Disconnect/Connect** button lets you toggle the WebSocket connection, demonstrating that edits made offline are merged when the connection is restored.

## Getting started

### Prerequisites

- [Node.js](https://nodejs.org/) (v16 or later recommended)

### Install and build

```bash
npm install        # installs dependencies and runs the webpack build (via postinstall)
```

To rebuild manually:

```bash
npm run dist       # bundles y-vis-network.js → dist/y-vis-network.bundle.js
```

### Start the WebSocket server

In a separate terminal:

```bash
npx y-websocket-server
```

This starts a Yjs WebSocket server on `ws://localhost:1234`.

### Open the demo

Open `y-vis-network.html` in a browser (e.g. via a local HTTP server or directly as a file). Open the same page in a second browser window to see real-time synchronisation.

## Files

| File | Description |
|------|-------------|
| `y-vis-network.js` | Main application — sets up Yjs, vis-network, and the sync logic |
| `y-vis-network with random init.js` | Alternative version that initialises with random nodes |
| `y-vis-network.html` | Demo page |
| `y-vis-network.css` | Styling for the network container and node edit popup |
| `webpack.config.js` | Webpack configuration (bundles to `dist/`) |

## Configuration

The WebSocket server URL is set in `y-vis-network.js` (line 28). Alternative URLs are commented out:

- `ws://localhost:1234` — default, local development
- `wss://demos.yjs.dev` — Yjs public demo server

## License

MIT — see `package.json` for details.

## Author

Nigel Gilbert ([n.gilbert@surrey.ac.uk](mailto:n.gilbert@surrey.ac.uk))
