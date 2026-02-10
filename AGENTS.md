# AGENTS.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Project Overview

A demonstration of integrating [Yjs](https://github.com/yjs/yjs) (CRDT library) with [vis-network](https://visjs.github.io/vis-network/) for real-time collaborative network graph editing. Multiple clients can simultaneously add, edit, and delete nodes and edges with automatic synchronization.

## Build and Development Commands

```bash
# Install dependencies and build
npm install

# Build bundle (webpack in development mode)
npm run dist

# Start development server (opens y-vis-network.html)
npm start
```

**Important:** Before running the app, start the WebSocket server in a separate terminal:
```bash
npx y-websocket-server
```
The WebSocket server runs on `ws://localhost:1234` by default.

## Architecture

### Synchronization Pattern

The app uses a bidirectional sync pattern between local vis-network DataSets and Yjs shared types:

1. **Local → Remote**: `nodes.on('*')` and `edges.on('*')` listeners detect local changes and update `yNodesMap`/`yEdgesMap`
2. **Remote → Local**: `yNodesMap.observe()` and `yEdgesMap.observe()` detect remote changes and update local DataSets

Each node/edge is tagged with `clientID` to prevent feedback loops (only changes from other clients trigger local updates).

### Key Data Structures

- `Y.Doc` - The shared Yjs document
- `yNodesMap`, `yEdgesMap` - Yjs Maps storing nodes and edges (separate maps because IDs may overlap)
- `nodes`, `edges` - vis-data DataSets for local rendering

### Entry Point

`y-vis-network.js` is the main source file, bundled by webpack to `dist/y-vis-network.bundle.js`.

### Files

- `y-vis-network.js` - Main application logic
- `y-vis-network with random init.js` - Alternative version that initializes with random nodes
- `y-vis-network.html` - Demo page
- `y-vis-network.css` - Styling for the network container and popup

## Configuration

WebSocket server URL is hardcoded in `y-vis-network.js` (line 27-31). Alternative URLs are commented out:
- `ws://localhost:1234` (default, local)
- `wss://cress.soc.surrey.ac.uk/wss`
- `wss://demos.yjs.dev`
