// const Structure = require('./Structure').Structure;
const { StructureStatus, Structure } = require('./Structure');
const CommandNode = require('./CommandNode').CommandNode;
const Farm = require('./Farm').Farm;
const StringUtils = require('../Utils/StringUtils');

const ClickAction = {
    QUERY: 0,
    STRUCT: 1,
    DELETE: 2
}

// game model
class Model {
    constructor() {
        this.reset();
    }

    reset() {
        this.coordStructureLookup = {}; // getCoordinateKey => structure.id
        this.nodes = [];                // structure.id => structure
        this.deadNodes = [];            // list of unused nodes which can be repurposed
        this.conns = {};
        this.CONNECT = null;
        this.clickAction = ClickAction.QUERY;
        this.selectedNode = null;
        this.selectedChildren = [];
        this.selectedAncestors = [];
        this.messages = ['This is Alpha version 0.2. Check out the github for details on how this works / what it is'];

        this.createStructure(0, 0, CommandNode);
    };

    getCoordinateKey(x, y) {
        // replace with hash in future?
        return JSON.stringify([x, y]);
    };

    getStructKey(struct) {
        return JSON.stringify([struct.xCoord, struct.yCoord])
    };

    isStructureAt(x, y) {
        const coordinate = this.getCoordinateKey(x, y);
        return this.isValidId(this.coordStructureLookup[coordinate]);
    };

    getStructureAt(x, y) {
        const id = this.coordStructureLookup[this.getCoordinateKey(x, y)];
        return this.getStructure(id);
    };

    createStructure(x, y, StructType) {
        if (this.isStructureAt(x, y)) {
            return;
        }
        if (this.deadNodes.length === 0) {
            // allocate new space
            let id = this.nodes.length;
            this.nodes.push(new StructType(id, x, y));

            let key = this.getCoordinateKey(x, y);
            this.coordStructureLookup[key] = id;
        }
        else {
            // reuse id, clean up old object
            let id = this.deadNodes.pop();
            this.nodes[id] = new StructType(id, x, y);

            let key = this.getCoordinateKey(x, y);
            this.coordStructureLookup[key] = id;
        }
        this.getStructureAt(x, y).init(this);
    };

    deleteStructure(id) {
        const struct = this.getStructure(id);
        struct.updateStatus(this, StructureStatus.INACTIVE);

        for (let inId of struct.inConns) {
            const inStruct = this.getStructure(inId);
            inStruct.removeOutConn(id);
        }
        for (let outId of struct.outConns) {
            const outStruct = this.getStructure(outId);
            outStruct.removeInConn(id);
        }

        delete this.coordStructureLookup[this.getStructKey(struct)];

        if (this.selectedNode === id) {
            this.setSelectedNode(null);
        }
        else {
            this.refreshSelectedNode();
        }

        this.deadNodes.push(id);

        this.rebuildConns();
    }

    createConnection(fromId, toId) {
        const fromStruct = this.getStructure(fromId);
        const toStruct = this.getStructure(toId);
        const isValid = fromStruct.withinRange(toStruct);

        if (!isValid) {
            this.addMessage(`cannot create connection between ${this.getStructKey(fromStruct)} and ${this.getStructKey(toStruct)} - exceeds range of ${fromStruct.range}`);
            return;
        }

        if (fromStruct.maxOutConns <= fromStruct.outConns.length) {
            this.addMessage(`Cannot create connection as node ${this.getStructKey(fromStruct)} has reached it's maximum number of outbound connections`);
            return;
        }

        if (toStruct.maxInConns <= toStruct.inConns.length) {
            this.addMessage(`Cannot create connection as node ${this.getStructKey(toStruct)} has reached it's maximum number of inbound connections`);
            return;
        }

        if (fromStruct.outConns.includes(toStruct.id)) {
            this.addMessage(`Cannot create connection between ${this.getStructKey(fromStruct)} and ${this.getStructKey(toStruct)} as the same connection already exists`);
            return;
        }

        if (toStruct.outConns.includes(fromStruct.id)) {
            this.addMessage(`Cannot create connection between ${this.getStructKey(fromStruct)} and ${this.getStructKey(toStruct)} as an inverse connection already exists`);
            return;
        }

        this.addMessage(`created connection between ${this.getStructKey(fromStruct)} and ${this.getStructKey(toStruct)}`);

        // model list
        fromStruct.outConns.push(toStruct.id);
        toStruct.inConns.push(fromStruct.id);

        // duplicate information for easier rendering (can be re-generated from stratch via RebuildConns())
        if (this.conns[fromStruct.id]) {
            this.conns[fromStruct.id].push(toStruct.id);
        }
        else {
            this.conns[fromStruct.id] = [toStruct.id];
        }

        this.refreshSelectedNode();
    };

    rebuildConns() {
        let conns = [];
        for (const struct of this.nodes) {
            if (struct.status === StructureStatus.INACTIVE || !struct.outConns) {
                continue;
            }
            conns[struct.id] = struct.outConns.slice(); // copy
        }
        this.conns = conns;
    }

    getStructure(id) {
        return this.nodes[id];
    };

    isValidId(id) {
        return id !== null && id !== undefined && id >= 0 && id < this.nodes.length && this.nodes[id].status !== StructureStatus.INACTIVE;
    };

    calcBgColour(x, y) {
        if (this.isValidId(this.CONNECT)) {
            let struct = this.getStructure(this.CONNECT);
            if (struct.pointInRange(x, y)) {
                return '#ffa500'; // orange
            }
        }

        const r1 = 255, g1 = 255, b1 = 240;//'#FFFFF0' -- whiteish
        const r2 = 144, g2 = 238, b2 = 144;//'#90EE90' -- green

        let factor = 0;
        for (let struct of this.nodes) {
            if (struct.status === StructureStatus.ACTIVE && struct.pointInRange(x, y) && struct instanceof Farm) {
                const dist = struct.distanceToPoint(x, y);
                factor = Math.min(1, factor + (struct.range - dist) / struct.range);
            }
        }

        let r = Math.round(factor * r2 + (1 - factor) * r1);
        let g = Math.round(factor * g2 + (1 - factor) * g1);
        let b = Math.round(factor * b2 + (1 - factor) * b1);
        // console.log(`${x}, ${y}, ${factor} -> '#${r.toString(16)}${g.toString(16)}${b.toString(16)}'`);

        return `#${r.toString(16)}${g.toString(16)}${b.toString(16)}`;
    };

    drawTile(x, y, pxX, pxY, dim, ctx) {
        const bgColour = this.calcBgColour(x, y);
        if (this.isStructureAt(x, y)) {
            const struct = this.getStructureAt(x, y);
            struct.draw(pxX, pxY, dim, ctx, bgColour);
            if (struct.id == this.selectedNode) {
                ctx.beginPath();
                ctx.strokeStyle = "red";
                ctx.linewidth = 10;
                ctx.rect(pxX, pxY, dim, dim);
                ctx.stroke();
            }
        }
        else {
            ctx.fillStyle = bgColour;
            ctx.fillRect(pxX + 1, pxY + 1, dim - 1, dim - 1);
        }
    };

    refreshSelectedNode() {
        const id = this.selectedNode;
        if (this.isValidId(id)) {
            this.selectedChildren = this.getAllChildren(id, true);
            this.selectedAncestors = this.getAllAncestors(id, true);
        }
        else {
            this.selectedChildren = [];
            this.selectedAncestors = [];
        }
    }

    setSelectedNode(id) {
        if (this.isValidId(id)) {
            this.selectedNode = id;
        } else {
            this.selectedNode = null;
        }
        this.refreshSelectedNode();
    }

    getAllChildren(id, includesSelf = false) {
        const getChildren = (struct) => struct.outConns;
        const children = this.bfs(id, getChildren);
        if (includesSelf) {
            children.push(id);
        }
        return children;
    };

    getAllAncestors(id, includesSelf = true) {
        const getAncestors = (struct) => struct.inConns;
        const ancestors = this.bfs(id, getAncestors);
        if (includesSelf) {
            ancestors.push(id);
        }
        return ancestors;
    };

    // performs a bfs, returns a list of ids of relatives.
    // uses prop(struct) to get relatives
    bfs(id, prop) {
        const root = this.getStructure(id);
        let currId = 0;
        let relatives = prop(root).slice(0); // clone
        while (relatives.length > currId) {
            const nextStruct = this.getStructure(relatives[currId]);
            for (let ele of prop(nextStruct)) {
                if (!relatives.includes(ele)) {
                    relatives.push(ele);
                }
            }
            currId += 1;
        }
        return relatives;
    };

    addMessage(message) {
        let date = new Date(Date.now());
        this.messages.push('[' + date.toLocaleTimeString() + '] ' + message);
    }

};

module.exports = { Model, ClickAction };