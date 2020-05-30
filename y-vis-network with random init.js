
import * as Y from 'yjs';
import {
	WebsocketProvider
}
from 'y-websocket';

import {
	Network
}
from "vis-network/peer/esm/vis-network";

import {
	DataSet
}
from "vis-data";

import 'vis-network/dist/vis-network.min.css';

/* 
Remember to start the WS provider first:
	npx y-websocket-server
 */
 
window.addEventListener('load', () => {
	init();
});

const doc = new Y.Doc();
const wsProvider = new WebsocketProvider('ws://localhost:1234', 'y-vis-network-example5', doc);

wsProvider.on('status', event => {
	console.log(event.status) // logs "connected" or "disconnected"
})

const yNodesMap = doc.getMap('nodes');
const yEdgesMap = doc.getMap('edges');
const clientID = doc.clientID;
console.log('My client ID: ' + doc.clientID);

var network = null;
var nodes = new DataSet();
var edges = new DataSet();
var data = {
	nodes: nodes,
	edges: edges
};

window.data = data;
window.yNodesMap = yNodesMap;
window.yEdgesMap = yEdgesMap;

/* 
nodes.on listens for when local nodes or edges are changed (added, updated or removed).
If a local node is removed, the yMap is updated to broadcat to other clients that the node 
has been deleted. If a local node is added or updated, that is also broadcast, with a 
copy of the node, augmented with this client's ID, so that the originator can be identified.
Nodes that are not originated locally are not broadcast (if they were, there would be a 
feedback loop, with each client re-broadcasting everything it received)
 */

nodes.on('*', (event, properties) =>
	{ console.log(event, properties);
	properties.items.forEach( id =>
		{	if (event == 'remove') {
				yNodesMap.delete(id.toString())
			}
			else {
				let obj = nodes.get(id);
				if (obj.clientID == undefined || obj.clientID == clientID) {
					obj.clientID = clientID;
					yNodesMap.set(id.toString(), obj);
					}
			}
		})
	});
/* 
yNodesMap.observe listens for changes in the yMap, reciving a set of the keys that have
had changed values.  If the change was to delete an entry, the corresponding node is
removed from the local nodes dataSet. Otherwise, the local node dataSet is updated (which 
includes adding a new node if it does not already exist locally).
 */

yNodesMap.observe( (event, trans) =>
	{ console.log(event, trans);
	for (let key of event.keysChanged) {
		if (yNodesMap.has(key)) {
			let  obj = yNodesMap.get(key);
			if (obj.clientID != clientID) {
				nodes.update(obj);
				}
			}
		else nodes.remove(key);
		}
	}); 

/* 
See comments above about nodes
 */
edges.on('*', (event, properties) =>
	{ console.log(event, properties);
	properties.items.forEach( id =>
		{	if (event == 'remove') {
				yEdgesMap.delete(id.toString())
			}
			else {
				let obj = edges.get(id);
				if (obj.clientID == undefined || obj.clientID == clientID) {
					obj.clientID = clientID;
					yEdgesMap.set(id.toString(), obj);
					}
			}
		})
	});
yEdgesMap.observe( (event, trans) =>
	{ console.log(event, trans);
	for (let key of event.keysChanged) {
		if (yEdgesMap.has(key)) { 
			let  obj = yEdgesMap.get(key);
			if (obj.clientID != clientID) {
				edges.update(obj);
				}
			}
		else edges.remove(key);
		}
	});
	
function draw() {

	// randomly create some nodes and edges
	var randomSeed =  Math.round(Math.random()*1000);
	var SFNdata = getScaleFreeNetwork(2);
	nodes.add(SFNdata.nodes, clientID);
	edges.add(SFNdata.edges, clientID);

	// create a network
	var container = document.getElementById('mynetwork');
	var options = {
		manipulation: {
			addNode: function(data, callback) {
				// filling in the popup DOM elements
				document.getElementById('operation').innerHTML = "Add Node";
				document.getElementById('node-id').value = data.id;
				document.getElementById('node-label').value = data.label;
				document.getElementById('saveButton').onclick = saveData.bind(this, data, callback);
				document.getElementById('cancelButton').onclick = clearPopUp.bind();
				document.getElementById('network-popUp').style.display = 'block';
			},
			editNode: function(data, callback) {
				// filling in the popup DOM elements
				document.getElementById('operation').innerHTML = "Edit Node";
				document.getElementById('node-id').value = data.id;
				document.getElementById('node-label').value = data.label;
				document.getElementById('saveButton').onclick = saveData.bind(this, data, callback);
				document.getElementById('cancelButton').onclick = cancelEdit.bind(this, callback);
				document.getElementById('network-popUp').style.display = 'block';
				data.clientID = undefined; // allow this client to edit nodes created by other clients
			},
			addEdge: function(data, callback) {
				if (data.from == data.to) {
					var r = confirm("Do you want to connect the node to itself?");
					if (r == true) {
						callback(data);
					}
				}
				else {
					callback(data);
				}
			},
			editEdge: function(data, callback) {
				data.clientID = undefined;
				callback(data); // allow this client to edit edges created by other clients
			}
		}
	};
	
	network = new Network(container, data, options);

	function getScaleFreeNetwork(nodeCount) {
		let nodes = [];
		let edges = [];
		let connectionCount = [];

		// randomly create some nodes and edges
		for (let i = 0; i < nodeCount; i++) {
			nodes.push({
				id: i,
				label: String(i)
			});

			connectionCount[i] = 0;

			// create edges in a scale-free-network way
			if (i == 1) {
				let from = i;
				let to = 0;
				edges.push({
					from: from,
					to: to
				});
				connectionCount[from]++;
				connectionCount[to]++;
			}
			else if (i > 1) {
				let conn = edges.length * 2;
				let rand = Math.floor(seededRandom() * conn);
				let cum = 0;
				let j = 0;
				while (j < connectionCount.length && cum < rand) {
					cum += connectionCount[j];
					j++;
				}


				let from = i;
				let to = j;
				edges.push({
					from: from,
					to: to
				});
				connectionCount[from]++;
				connectionCount[to]++;
			}
		}

		return {
			nodes: nodes,
			edges: edges
		};
	}


	function seededRandom() {
		let x = Math.sin(randomSeed++) * 10000;
		return x - Math.floor(x);
	}


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

	const connectBtn = (document.getElementById('y-connect-btn'))
	  connectBtn.addEventListener('click', () => {
		if (wsProvider.shouldConnect) {
		  wsProvider.disconnect()
		  connectBtn.textContent = 'Connect'
		} else {
		  wsProvider.connect()
		  connectBtn.textContent = 'Disconnect'
		}
	  })
  
}

function init() {
	draw();
}


