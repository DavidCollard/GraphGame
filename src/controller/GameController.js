const { Model, ClickAction } = require('../model/Model');
const Farm = require('../model/Farm').Farm;
const utils = require('../Utils/coordinateUtils');

class GameController {
    constructor(model) {
        this.model = model;
        this.modelUpdateSubscribers = [];
    };

    getModel() {
        return this.model;
    };

    subscribe(obj) {
        this.modelUpdateSubscribers.push(obj);
    };

    updateSubscribers() {
        for (let id in this.modelUpdateSubscribers) {
            let subscriber = this.modelUpdateSubscribers[id];
            subscriber();
        }
    };

    gameTick() {
        for (let struct of this.model.nodes)
        {
            struct.gameTick(this.model);
        }

        for (let struct of this.model.nodes)
        {
            struct.finalizeUpdates(this.model);
        }
    };

    evtXYClick(coordX, coordY) {
        const clickAction = this.model.clickAction;
        const coordinate = this.model.getCoordinateKey(coordX, coordY);
        const id = this.model.coordStructureLookup[coordinate];

        if (clickAction === ClickAction.STRUCT) {
            if (this.model.isValidId(id)) {
                this.model.CONNECT = id;
            }
            else {
                this.model.createStructure(coordX, coordY, Farm);
            }
        }
        else if (clickAction === ClickAction.QUERY) {
            this.model.setSelectedNode(id);
        }
        else if (clickAction === ClickAction.DELETE) {
            if (this.model.isValidId(id)) {
                this.model.deleteStructure(id);
            }
        }
        this.updateSubscribers();
    };

    evtDragUp(coordX, coordY) {
        let model = this.model;
        let coordinate = model.getCoordinateKey(coordX, coordY);
        let toId = model.coordStructureLookup[coordinate];
        let fromId = model.CONNECT;

        if (model.isValidId(toId) && model.isValidId(fromId) && toId != fromId) {
            let fromStruct = model.nodes[fromId];
            model.createConnection(fromId, toId);
        }
        model.CONNECT = null;
        this.updateSubscribers();
    }

    evtChangeClickAction(action) {
        this.model.clickAction = action;
    };
};


module.exports = { GameController };