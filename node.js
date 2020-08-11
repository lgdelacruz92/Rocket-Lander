/**
 * Node class
 */
class Node {
    constructor(identificationNumber) {
        if (identificationNumber === undefined) throw Error('Value required: identificationNumber.');
        // The identification number of of the node
        this.id = identificationNumber;

        // Value
        this.value = 0;
    }

    /**
     * Returns a copy of itself
     */
    copy() {
        return new Node(this.id);
    }
}

export default Node;