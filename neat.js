const random = (lowerBound, upperBound) => {
    return Math.random() * upperBound + lowerBound;
}

const NEAT = {
    /**
     * Converts a 
     * @param {Object} json The neat in json object
     */
    fromJSON: (json) => {
        const neat = new Neat(json.inputNumber, json.outputNumber);
        neat.replaceNodes(json.nodes);
        neat.replaceConnections(json.connections);
        return neat;
    }
}

class Neat {
    constructor(inputNumber, outputNumber) {
        if (!inputNumber) throw Error('Value required: inputNumber.');
        if (!outputNumber) throw Error('Value required: outputNumber.');
        this.inputNumber = inputNumber;
        this.outputNumber = outputNumber;
        
        this.inputNodeIds = {};
        this.outputNodeIds = {};
        this.nodeCurrentNumber = 0;
        this.connectionCurrentNumber = 0;
        this._initNodes();
        this._initConnections();
    }

    /**
     * Distance function for campatibility test with other Neats
     * @param {Neat} otherNeat The other neat
     */
    dist(otherNeat) {
        // Get excess
        let connectionsMap = {};
        if (this.connections.length > otherNeat.connections.length) {
            connectionsMap = this._buildConnectionMatches(this.connections, otherNeat.connections);
            const excess = this._countExcess(connectionsMap);
            const disjoint = this._countDisjoints(connectionsMap, this.connections, otherNeat.connections);
            const avgWeightDiff = this._getAvgWeightDifferences(connectionsMap);
            return (excess / this.connections.length) + (disjoint / this.connections.length) + avgWeightDiff;
        } else {
            connectionsMap = this._buildConnectionMatches(otherNeat.connections, this.connections);
            const excess = this._countExcess(connectionsMap);
            const disjoint = this._countDisjoints(connectionsMap, otherNeat.connections, this.connections);
            const avgWeightDiff = this._getAvgWeightDifferences(connectionsMap);
            return (excess / otherNeat.connections.length) + (disjoint / otherNeat.connections.length) + avgWeightDiff;
        }
    }

    /**
     * Gets the average weight differences between matching genes
     * @param {Object} connectionsMap The connection map
     */
    _getAvgWeightDifferences(connectionsMap) {

        let avgWeightDiff = 0;
        const keys = Object.keys(connectionsMap);
        let countOfMatching = 0;
        for (let i = 0; i < keys.length; i++) {
            if (connectionsMap[keys[i]].length === 2) {
                avgWeightDiff += (connectionsMap[keys[i]][0].weight - connectionsMap[keys[i]][1].weight) / 2;
                countOfMatching +=1;
            }
        }
        if (countOfMatching === 0) {
            return 0;
        } else {
            return avgWeightDiff / countOfMatching;
        }

    }

    /**
     * Counts the number of disjoints in a connection
     * @param {Object} connectionMap Connection map
     * @param {Array} connectionsBigger Bigger array of connections
     * @param {Array} connectionsSmaller Smaller array of connections
     */
    _countDisjoints(connectionMap, connectionsBigger, connectionsSmaller) {
        if (connectionsSmaller.length > connectionsBigger) {
            throw Error('Connectionsbigger is smaller than connections smaller. Please switch the input parameters.');
        }

        let disjointCount = 0;
        for (let i = 0; i < connectionsSmaller.length; i++) {
            const connectionIn = connectionsSmaller[i].in;
            const connectionPair = connectionMap[connectionIn];
            if (connectionPair.length !== 1 && connectionPair.length !== 2) {
                throw Error('Something went wrong. Connection pairs should not be more than two.');
            }
            
            if (connectionPair.length === 1) {
                disjointCount += 1;
            }
        }
        return disjointCount;
    }

    /**
     * Counts the amount of excess in a connection map
     * @param {Object} connectionsMap The connections map
     */
    _countExcess(connectionsMap) {
        
        // Iterate backwards on the keys
        // Count amount of no pairs
        let excess = 0;
        const keys = Object.keys(connectionsMap);
        let i = keys.length - 1;
        while (i >= 0 && connectionsMap[keys[i]].length < 2) {
            excess += 1;
            i -= 1;
        }

        if (connectionsMap[keys[i]].length === 0) {
            throw Error('This should not happen. Every key should have at least 1 item.')
        }
        return excess;
    }

    /**
     * Builds connection match map
     * @param {Array} connections1 The bigger connections array
     * @param {Array} connections2 The smaller connections array
     */
    _buildConnectionMatches(connections1, connections2) {
        if (connections2.length > connections1.length) {
            throw Error('Connection2 is bigger than connection 1. Please reverse the input parameters.');
        }

        const connectionsMap = {};
        for (let i = 0; i < connections1.length; i++) {
            const connection1id = connections1[i].in;
            connectionsMap[connection1id] = [connections1[i]];
            for (let j = 0; j < connections2.length; j++) {
                if (connection1id === connections2[j].in) {
                    connectionsMap[connection1id].push(connections2[j]);
                }
            }
        }

        // Sanity validation of the map
        const keys = Object.keys(connectionsMap);
        for (let i = 0; i < keys.length; i++) {
            if (connectionsMap[keys[i]].length > 2) {
                throw Error('Something went wrong. You shouldnt have more than 2 in a pair.');
            }
        }

        return connectionsMap;
    }

    /**
     * Exports the Neat into it's JSON representation
     * @return {Object}
     */
    toJSON() {
        return {
            inputNumber: this.inputNumber,
            outputNumber: this.outputNumber,
            connections: this.connections.map(cnn => ({
                innovationNumber: cnn.in,
                weight: cnn.weight,
                expressed: cnn.expressed,
                inNode: cnn.inNode.id,
                outNode: cnn.outNode.id
            })),
            nodes: this.nodes.map(n => ({
                identificationNumber: n.id,
                value: n.value
            }))
        }
    }

    /**
     * Replace nodes
     * @param {Array} nodesJSON The nodes json array
     */
    replaceNodes(nodesJSON) {
        this.nodes = [];
        for (let i = 0; i < nodesJSON.length; i++) {
            this.nodes.push(new Node(nodesJSON[i].identificationNumber, nodesJSON[i].value));
        }
        this._updateNodeNumber();
    }

    /**
     * Replaces connections from array of json formatten connections
     * @param {Array} connectionsJSON The connections json array
     */
    replaceConnections(connectionsJSON) {
        this.connections = [];
        for (let i = 0; i < connectionsJSON.length; i++) {
            const connection = new Connection(connectionsJSON[i].innovationNumber, connectionsJSON[i].weight, connectionsJSON[i].expressed);
            const inNodeResult = this.nodes.find(n => n.id === connectionsJSON[i].inNode);
            if (inNodeResult === undefined) {
                throw Error(`Connection indexed ${i} is improperly formatted ${connectionsJSON[i].inNode} not found.`);
            } else {
                connection.inNode = inNodeResult;
            }

            const outNodeResult = this.nodes.find(n => n.id === connectionsJSON[i].outNode);
            if (outNodeResult === undefined) {
                throw Error(`Connection indexed ${i} is improperly formatted ${connectionsJSON[i].outNode} not found.`);
            } else {
                connection.outNode = outNodeResult;
            }

            this.connections.push(connection);
        }
        this._updateConnectionNumber();
    }

    /**
     * Returns a copy of itself
     * @return {Neat} new Neat copy
     */ 
    copy() {
        const newNeat = new Neat(this.inputNumber, this.outputNumber);
        newNeat.inputNodeIds = JSON.parse(JSON.stringify(this.inputNodeIds));
        newNeat.outputNodeIds = JSON.parse(JSON.stringify(this.outputNodeIds));
        newNeat.connections = this.connections.map(cnn => cnn.copy());
        this._fillNodesFromConnections(newNeat);
        this._updateNodeNumber();
        this._updateConnectionNumber();
        return newNeat;
    }

    /**
     * Fills it's nodes with the proper nodes
     * @param {Neat} newNeat The new Neat
     */
    _fillNodesFromConnections(newNeat) {
        newNeat.nodes = [];
        const alreadyExists = {};
        newNeat.connections.forEach(cnn => {
            if (!alreadyExists[cnn.inNode.id]) {
                newNeat.nodes.push(cnn.inNode);
                alreadyExists[cnn.inNode.id] = true;
            }
            if (!alreadyExists[cnn.outNode.id]) {
                newNeat.nodes.push(cnn.outNode);
                alreadyExists[cnn.outNode.id] = true;
            }
        });
        newNeat.nodes.sort((n1, n2) => n1.id - n2.id);
    }

    /**
     * Initializes the connections of Neat
     */
    _initConnections() {
        this.connections = [];

        for (let i = 0; i < this.inputNumber; i++) {
            for (let j = this.inputNumber; j < this.inputNumber + this.outputNumber; j++) {
                const outNode = this.nodes[j];
                const inNode = this.nodes[i];
                const innovationNumber = this.connectionCurrentNumber;
                const newConnection = new Connection(innovationNumber, random(-2, 2), true);
                newConnection.inNode = inNode;
                newConnection.outNode = outNode;
                this.connections.push(newConnection);
                this.connectionCurrentNumber += 1;
            }
        }
    }

    /**
     * Initializes the nodes of Neat
     */
    _initNodes() {
        this.nodes = [];
        for (let i = 0; i < this.inputNumber; i++) {
            const newId = this.nodeCurrentNumber;
            this.inputNodeIds[newId] = true;
            this.nodes.push(new Node(newId));
            this.nodeCurrentNumber += 1;
        }

        const totalNodes = this.inputNumber + this.outputNumber;
        for (let i = this.inputNumber; i < totalNodes; i++) {
            const newId = this.nodeCurrentNumber;
            this.outputNodeIds[newId] = true;
            this.nodes.push(new Node(newId));
            this.nodeCurrentNumber += 1;
        }
    }

    /**
     * True if there is a cycle in the connection false otherwise
     * @return {boolean}
     */
    noCycle() {
        if (this.connections.length === 0) throw Error('The connections are empty.');
        if (this.nodes.length === 0) throw Error('The nodes are empty.');
        // * DFS search on all input nodes
        for (let i = 0; i < this.inputNumber; i++) {

            const visited = {}
            let currentNode = this.nodes[i];
            let connections = this._findInConnections(currentNode.id);
            
            if (connections.length === 0) {
                return false;
            }

            let connection = connections[0];

            while (connection !== null && connection.outNode !== null) {
                if (visited[currentNode.id] === true) {
                    return false;
                }
                visited[currentNode.id] = true;

                currentNode = connection.outNode;
                connections = this._findInConnections(currentNode.id);
                if (connections.length > 0) {
                    connection = connections[0];
                } else {
                    connection = null;
                }
            }
        }
        return true;
    }

    /**
     * Mutates the network
     *    - If no option is passed then it randomly selects a mutation method.
     * @param {bool} addNode Optional parameter to choose to mutate using addNode
     * @param {bool} addConnection Optional parameter to choose to mutate by adding a connection
     */
    mutate(addNode, addConnection) {
        if (addNode) {
            this._mutateAddNode();
        } else if (addConnection) {
            this._mutateAddConnection();
        }
    }

    /**
     * Mutate the network by adding a random connection.
     */
    _mutateAddConnection() {
        let index1 = parseInt(random(0, this.nodes.length));
        let index2 = parseInt(random(0, this.nodes.length));
        let node1 = this.nodes[Math.min(index1, index2)];
        let node2 = this.nodes[Math.max(index1, index2)];

        while ((this.inputNodeIds[node1.id] && this.inputNodeIds[node2.id]) 
            || node1.id === node2.id
            || (this.outputNodeIds[node1.id] && this.outputNodeIds[node2.id])
            ) {
            index1 = parseInt(random(0, this.nodes.length));
            index2 = parseInt(random(0, this.nodes.length));
            node1 = this.nodes[Math.min(index1, index2)];
            node2 = this.nodes[Math.max(index1, index2)];
        }

        const newConnection = new Connection(this.connectionCurrentNumber + 1, random(-2, 2), true);
        if (this._isHiddenLayerNode(node2) && this.outputNodeIds[node1.id]) {
            newConnection.inNode = node2;
            newConnection.outNode = node1;
        }
        else if (this.outputNodeIds[node2.id] && this._isHiddenLayerNode(node1)) {
            newConnection.inNode = node1;
            newConnection.outNode = node2;
        } 
        else if (this._isHiddenLayerNode(node2) && this._isHiddenLayerNode(node1)) {
            if (node1.id < node2.id) {
                newConnection.inNode = node1;
                newConnection.outNode = node2;
            } else {
                newConnection.inNode = node2;
                newConnection.outNode = node1;
            }
        }
        else if (this.inputNodeIds[node1.id] && this.outputNodeIds[node2.id]) {
            newConnection.inNode = node1;
            newConnection.outNode = node2;
        }
        else if (this.inputNodeIds[node2.id] && this.outputNodeIds[node1.id]) {
            newConnection.inNode = node2;
            newConnection.outNode = node1;
        }
        else if (this._isHiddenLayerNode(node2) && this.inputNodeIds[node1.id]) {
            newConnection.inNode = node1;
            newConnection.outNode = node2;
        } else if (this._isHiddenLayerNode(node1) && this.inputNodeIds[node2.id]) {
            newConnection.inNode = node2;
            newConnection.outNode = node1;
        }
        else {
            throw Error('This should not happen.');
        }

        this.connections.push(newConnection);
        if (this.noCycle()) {
            this._updateConnectionNumber();
        } else {
            this.connections.splice(this.connections.length - 1, 1);
        }
    }

    /**
     * Node is hidden layer node
     * @param {Node} node The node to check
     */
    _isHiddenLayerNode(node) {
        return !this.inputNodeIds[node.id] && !this.outputNodeIds[node.id];
    }

    /**
     * Mutate the network by randomly adding a node in a connection
     */
    _mutateAddNode() {
        const randomNum = parseInt(random(0, this.connections.length));
        const connection = this.connections[randomNum];
        const inNode = connection.inNode;
        const outNode = connection.outNode;
        const newNode = new Node(this.nodeCurrentNumber);
        const newConnection1 = new Connection(this.connectionCurrentNumber + 1, random(-2, 2), true);
        const newConnection2 = new Connection(this.connectionCurrentNumber + 2, random(-2, 2), true);
        newConnection1.inNode = inNode;
        newConnection1.outNode = newNode;
        newConnection2.inNode = newNode;
        newConnection2.outNode = outNode;
        this.nodes.push(newNode);
        this.connections.splice(randomNum, 1);
        this.connections.push(newConnection1);
        this.connections.push(newConnection2);

        this._updateNodeNumber();
        this._updateConnectionNumber();
    }

    /**
     * This activates the network according to the inputs
     * @param {Array} inputs The inputs of the network in array format and normalized
     */
    activate(inputs) {
        this.nodes.map(n => { n.value = 0; });
        if (!Array.isArray(inputs)) throw Error('Invalid type: inputs must be an array.');
        if (inputs.length !== this.inputNumber) throw Error(`Invalid number of inputs: this network requires ${this.inputNumber} inputs.`);

        for (let i = 0; i < this.nodes.length; i++) {
            this.nodes[i].value = 0;
        }

        // Make stability map
        const nodeStability = [];
        for (let i = 0; i < this.nodes.length; i++) {
            nodeStability.push(false);
        }

        // Label the inputs and stabilize
        for (let i = 0; i < this.inputNumber; i++) {
            this.nodes[i].value = inputs[i];
            nodeStability[i] = true;
        }

        // If in connections already found once, no need to do it again.
        const inConnectionsMap = {};

        // Activate
        while(!this._allStable(nodeStability)) {
            for (let i = 0; i < this.nodes.length; i++) {
                if (this.inputNodeIds[this.nodes[i].id] === undefined && !nodeStability[i]) {
                    // Find in connections
                    let connections = [];
                    if (inConnectionsMap[this.nodes[i].id] !== undefined) {
                        connections = inConnectionsMap[this.nodes[i].id];
                    } else {
                        connections = this._findOutConnections(this.nodes[i].id);
                    }

                    const inNodeSet = connections.map(cnn => {
                        return cnn.inNode;
                    });

                    if (this._isSetOfNodesStable(inNodeSet, nodeStability)) {
                        connections.forEach(cnn => { 
                            cnn.activate(); 
                        });
                        nodeStability[i] = true;
                    } else if (inNodeSet.length === 0) {
                        connections.forEach(cnn => { 
                            cnn.activate(); 
                        });
                        nodeStability[i] = true;
                    }
                }
            }
        }

        const result = [];
        for (let i = this.inputNumber; i < this.inputNumber + this.outputNumber; i++) {
            result.push(this.nodes[i].value);
        }
        return result.map(r => this._sigmoid(r));
    }

    /**
     * Finds in connections of a particular node
     * @param {Node} nodeId The node id to find connections for
     */
    _findInConnections(nodeId) {
        const connections = [];
        for (let i = 0; i < this.connections.length; i++) {
            if (nodeId === this.connections[i].inNode.id) {
                connections.push(this.connections[i]);
            }
        }
        return connections;
    }

    /**
     * Finds out connections of a particular node
     * @param {Node} nodeId The node id to find connections for
     */
    _findOutConnections(nodeId) {
        const connections = [];
        for (let i = 0; i < this.connections.length; i++) {
            if (nodeId === this.connections[i].outNode.id) {
                connections.push(this.connections[i]);
            }
        }
        return connections;
    }

    /**
     * True if all true false otherwise
     * @param {Array} nodeStability Array of stability map for the nodes
     */
    _allStable(nodeStability) {
        for (let i = 0; i < nodeStability.length; i++) {
            if (nodeStability[i] === false) {
                return false;
            }
        }
        return true;
    }

    /**
     * True if a set of nodes are all stable otherise false
     * @param {Array} nodeSet The set of nodes to check
     * @param {Array} nodeStability The mapping of stable nodes
     */
    _isSetOfNodesStable(nodeSet, nodeStability) {
        for (let i = 0; i < nodeSet.length; i++) {
            if (nodeStability[nodeSet[i].id] === false) {
                return false;
            }
        }
        return true;
    }

    /**
     * Sigmoid function of the output
     * @param {number} x The number to convert to sigmoid
     */
    _sigmoid(x) {
        return (Math.pow(2.72, x))/(Math.pow(2.72, x) + 1);
    }

    /**
     * Function that crossovers this neat with another neat
     * @param {Neat} otherNeat The neat network to crossover with
     * @param {boolean} deleteExcess Option to delete excess or not
     * @return {Neat} New child neat from the crossover
     */
    crossOver(otherNeat) {

        const connectionPairs = this._getConnectionPairs(otherNeat);
        const innovationNumbers = Object.keys(connectionPairs);
        
        // Make new child
        const newNeatChild = new Neat(this.inputNumber, this.outputNumber);
        this._produceChildConnections(newNeatChild, innovationNumbers, connectionPairs);
        this._fillNodesFromConnections(newNeatChild);
        this._updateNodeNumber();
        this._updateConnectionNumber();
        newNeatChild._updateNodeNumber();
        newNeatChild._updateConnectionNumber();
        
        return newNeatChild;
    }

    /**
     * Gets the connection pairs between this and other neat
     * @param {Neat} otherNeat The neat crossing over with
     */
    _getConnectionPairs(otherNeat) {
        const connectionPairs = {};
        this.connections.forEach(cnn => { this._fillConnectionPairs(cnn, connectionPairs) });
        otherNeat.connections.forEach(cnn => { this._fillConnectionPairs(cnn, connectionPairs)});
        return connectionPairs;
    }

    /**
     * Produces the connections of the child.
     * The connections are deep copy connections
     * @param {Neat} newNeatChild The Neat child
     * @param {Array} innovationNumbers Array of innovation numbers representing all the connections found
     * @param {Object} nodePairs Pairs of connections based on innovation numbers.
     * @return void
     */
    _produceChildConnections(newNeatChild, innovationNumbers, nodePairs) {
        newNeatChild.connections = []; //
        newNeatChild.connectionCurrentNumber = 0;
        innovationNumbers.forEach(innoNumber => {
            const connectionPair = nodePairs[innoNumber];
            if (connectionPair.length === 1) {
                newNeatChild.connections.push(connectionPair[0].copy());
            } else if (connectionPair.length === 2) {
                const randNum = Math.random();
                newNeatChild.connections.push(connectionPair[randNum > 0.5 ? 1 : 0].copy());
            } else {
                throw Error(`This should never happen.  Something went wrong. function: crossOver ${connectionPair}`);
            }
        });
    }

    /**
     * Fills the node pairs map
     * @param {Connection} cnn The Connection to append
     * @param {Object} nodePairs Mapping of the node pairs
     */
    _fillConnectionPairs(cnn, nodePairs) {
        if (nodePairs[cnn.in]) {
            nodePairs[cnn.in].push(cnn);
        } else {
            nodePairs[cnn.in] = [cnn];
        }
    }

    /**
     * Updates the node number based on node number max
     */
    _updateNodeNumber() {
        let max = 0;
        for (let i = 0; i < this.nodes.length; i++) {
            if (this.nodes[i].id > max) {
                max = this.nodes[i].id;
            }
        }
        this.nodeCurrentNumber = max + 1;
    }

    /**
     * Updates the connection number
     */
    _updateConnectionNumber() {
        let max = 0;
        for (let i = 0; i < this.connections.length; i++) {
            if (this.connections[i].in > max) {
                max = this.connections[i].in;
            }
        }
        this.connectionCurrentNumber = max;
    }
}