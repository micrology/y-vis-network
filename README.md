# y-vis-network
## yjs used to share an editable network graph with vis-network

This is an example of how one can use [yjs](https://github.com/yjs/yjs.git) to allow the collaborative editing of a network graph (of e.g. a social network) in real time using the 
[vis-network](https://github.com/visjs/vis-network.git) package.

To install the example, do this (these instructions assume that you already have `git` and `node.js/npm` installed):

1. Clone the repository to your local disk: `git clone https://github.com/micrology/y-vis-network.git`
1. Change directory: `cd y-vis-network`
1. Install the required modules from npm: `npm install`
1. Create a html/js bundle: `npm run dist`
1. Set up a local websocket server: `npx y-websocket-server &`
1. Start the example: `npm run start`
1. Click on 'Add node' to create a node, and then another
1. Click on 'Add edge' to link the two nodes
1. Open another browser (or another tab in this browser) and copy the address from the first page into the address bar of 
the new browser or tab. Observe that the same network graph appears, and that any change in one graph is mirrored in the other.

A much fancier version of this is in development and can be found at `https://cress.soc.surrey.ac.uk/prism/prism.html`
