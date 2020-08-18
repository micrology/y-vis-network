/* demonstration of the integration of vis-network network visualisation package
	with yjs CRDT package
	
	Nigel Gilbert n.gilbert@surrey.ac.uk
	January 2020
*/

import * as Y from 'yjs';
import { WebsocketProvider } from 'y-websocket';
import * as vis from 'vis-network/peer/esm/vis-network';
import { DataSet } from 'vis-data';

import 'vis-network/dist/vis-network.min.css';

/* 
Remember to start the WS provider first:
	npx y-websocket-server
 */

window.addEventListener('load', () => {
	init();
});

/* 
create a new shared document and start the WebSocket provider
 */
const doc = new Y.Doc();
const wsProvider = new WebsocketProvider(
//	'ws://localhost:1234',
	'wss://cress.soc.surrey.ac.uk/wss',
	'y-vis-network-example6',
	doc
);
wsProvider.on('status', (event) => {
	console.log(event.status); // logs "connected" or "disconnected"
});

/* 
create a yMap for the nodes and one for the edges (we need two because there is
no guarantee that the the ids of nodes will differ from the ids of edges 
*/
const yNodesMap = doc.getMap('nodes');
const yEdgesMap = doc.getMap('edges');

// used to identify nodes and edges created by this client
const clientID = doc.clientID;
console.log('My client ID: ' + doc.clientID);

var network = null;
const nodes = new DataSet();
const edges = new DataSet();
const data = {
	nodes: nodes,
	edges: edges,
};

//for convenience when debugging
window.data = data;
window.yNodesMap = yNodesMap;
window.yEdgesMap = yEdgesMap;

/* 
nodes.on listens for when local nodes or edges are changed (added, updated or 
removed). If a local node is removed, the yMap is updated to broadcat to 
other clients that the node has been deleted. If a local node is added or 
updated, that is also broadcast, with a copy of the node, augmented with this 
client's ID, so that the originator can be identified.

Nodes that are not originated locally are not broadcast (if they were, 
there would be a feedback loop, with each client re-broadcasting everything 
it received).
*/

nodes.on('*', (event, properties) => {
	properties.items.forEach((id) => {
		if (event == 'remove') {
			yNodesMap.delete(id.toString());
		} else {
			let obj = nodes.get(id);
			if (obj.clientID == undefined || obj.clientID == clientID) {
				obj.clientID = clientID;
				yNodesMap.set(id.toString(), obj);
			}
		}
	});
});

/* 
yNodesMap.observe listens for changes in the yMap, receiving a set of the keys 
that have had changed values.  If the change was to delete an entry, the 
corresponding node is removed from the local nodes dataSet. Otherwise, the 
local node dataSet is updated (which includes adding a new node if it does not 
already exist locally).
*/

yNodesMap.observe((event, trans) => {
	for (let key of event.keysChanged) {
		if (yNodesMap.has(key)) {
			let obj = yNodesMap.get(key);
			if (obj.clientID != clientID) {
				nodes.update(obj);
			}
		} else nodes.remove(key);
	}
});

/* 
See comments above about nodes
*/
edges.on('*', (event, properties) => {
	properties.items.forEach((id) => {
		if (event == 'remove') {
			yEdgesMap.delete(id.toString());
		} else {
			let obj = edges.get(id);
			if (obj.clientID == undefined || obj.clientID == clientID) {
				obj.clientID = clientID;
				yEdgesMap.set(id.toString(), obj);
			}
		}
	});
});

yEdgesMap.observe((event, trans) => {
	for (let key of event.keysChanged) {
		if (yEdgesMap.has(key)) {
			let obj = yEdgesMap.get(key);
			if (obj.clientID != clientID) {
				edges.update(obj);
			}
		} else edges.remove(key);
	}
});

/* 
draw() is unchanged from the standard example from vis-network, with the 
exception of the statements 'data.clientID = undefined;' (added twice).
*/
function draw() {
	// create a network
	var container = document.getElementById('mynetwork');
	var options = {
		manipulation: {
			addNode: function (data, callback) {
				// filling in the popup DOM elements
				document.getElementById('operation').innerHTML = 'Add Node';
				document.getElementById('node-id').value = data.id;
				document.getElementById('node-label').value = data.label;
				document.getElementById('saveButton').onclick = saveData.bind(
					this,
					data,
					callback
				);
				document.getElementById(
					'cancelButton'
				).onclick = clearPopUp.bind();
				document.getElementById('network-popUp').style.display =
					'block';
			},
			editNode: function (data, callback) {
				// filling in the popup DOM elements
				document.getElementById('operation').innerHTML = 'Edit Node';
				document.getElementById('node-id').value = data.id;
				document.getElementById('node-label').value = data.label;
				document.getElementById('saveButton').onclick = saveData.bind(
					this,
					data,
					callback
				);
				document.getElementById(
					'cancelButton'
				).onclick = cancelEdit.bind(this, callback);
				document.getElementById('network-popUp').style.display =
					'block';
				// allow this client to edit nodes created by other clients
				data.clientID = undefined;
			},
			addEdge: function (data, callback) {
				if (data.from == data.to) {
					var r = confirm(
						'Do you want to connect the node to itself?'
					);
					if (r == true) {
						callback(data);
					}
				} else {
					callback(data);
				}
			},
			editEdge: function (data, callback) {
				// allow this client to edit edges created by other clients
				data.clientID = undefined;
				callback(data);
			},
		},
	};

	network = new vis.Network(container, data, options);

	function clearPopUp() {
		document.getElementById('saveButton').onclick = null;
		document.getElementById('cancelButton').onclick = null;
		document.getElementById('network-popUp').style.display = 'none';
	}

	function cancelEdit(callback) {
		clearPopUp();
		callback(null);
	}

	function saveData(data, callback) {
		data.id = document.getElementById('node-id').value;
		data.label = document.getElementById('node-label').value;
		clearPopUp();
		callback(data);
	}

	// activate a button to switch the provider on or off (demonstrates that
	// the network can be changed ofline and then updates when back on line)

	const connectBtn = document.getElementById('y-connect-btn');
	connectBtn.addEventListener('click', () => {
		if (wsProvider.shouldConnect) {
			wsProvider.disconnect();
			connectBtn.textContent = 'Connect';
		} else {
			wsProvider.connect();
			connectBtn.textContent = 'Disconnect';
		}
	});
}

function init() {
	draw();
}
