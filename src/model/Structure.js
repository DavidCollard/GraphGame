const utils = require('../Utils/coordinateUtils');

const StructureStatus = {
    ACTIVE: 0,
    INACTIVE: 1,
    BUILDING: 2
};

class Structure {
    constructor(id, xCoord, yCoord, range, maxInConns, maxOutConns, buildCost) {
        this.id = id;
        this.status = StructureStatus.BUILDING;
        this.xCoord = xCoord;
        this.yCoord = yCoord;
        this.inConns = [];    //list of id's
        this.outConns = [];   //list of id's
        this.range = range;   //maximum euclidian distance for a connection
        this.maxInConns = maxInConns;
        this.maxOutConns = maxOutConns;

        this.buildProgress = 0;
        this.buildCost = buildCost;
        this.currency = 0;
        this.pendingCurrency = 0;
    };

    // pxX/pxY indicate the top left corner of the cell to be drawn
    // dim is the dimension of the square sprite to be drawn
    // ctx is the canvas context for the draw
    draw(pxX, pxY, dim, ctx, bgColour) {
        ctx.fillStyle = bgColour;
        ctx.fillRect(pxX + 1, pxY + 1, dim - 1, dim - 1);

        const buildRatio = (this.buildProgress / this.buildCost);
        ctx.lineWidth = 1;
        ctx.strokeStyle = "#000";

        if (buildRatio === 0) {
            ctx.beginPath();
            ctx.arc(
                pxX + 0.5 * dim,
                pxY + 0.5 * dim,
                dim * 0.25,
                0,
                2 * Math.PI
            );
            ctx.fill();
        }
        else if (buildRatio !== 1) {
            ctx.beginPath();
            ctx.arc(
                pxX + 0.5 * dim,
                pxY + 0.5 * dim,
                dim * 0.25,
                0,
                2 * Math.PI
            );
            ctx.fill();
            ctx.stroke();

            ctx.fillStyle = '#00EE00';
            ctx.beginPath();
            ctx.moveTo(pxX + 0.5 * dim, pxY + 0.5 * dim);
            ctx.lineTo(pxX + 0.75 * dim, pxY + 0.5 * dim);

            ctx.arc(
                pxX + 0.5 * dim,
                pxY + 0.5 * dim,
                dim * 0.25,
                0,
                buildRatio * 2 * Math.PI
            );
            ctx.lineTo(pxX + 0.5 * dim, pxY + 0.5 * dim);
            ctx.fill();
        }
        else {
            ctx.beginPath();
            ctx.fillStyle = '#0000EE';
            ctx.arc(
                pxX + 0.5 * dim,
                pxY + 0.5 * dim,
                dim * 0.25,
                0,
                2 * Math.PI
            );
            ctx.strokeStyle = "#000";
            ctx.fill();
        }
        ctx.stroke();
    };

    gameTick(model) {
        if (this.currency < this.outConns.length) return;

        for (let id of this.outConns) {
            model.getStructure(id).acceptCurrency(1);
        }
        this.pendingCurrency -= this.outConns.length;
    };

    acceptCurrency(currency) {
        const diff = this.buildCost - this.buildProgress;
        this.buildProgress = Math.min(this.buildProgress + currency, this.buildCost);
        this.pendingCurrency += Math.max(currency - diff, 0);
    };

    finalizeUpdates(model) {
        if (this.status === StructureStatus.BUILDING && this.buildProgress === this.buildCost) {
            this.updateStatus(model, StructureStatus.ACTIVE);
        }
        this.currency += this.pendingCurrency;
        this.pendingCurrency = 0;
    };

    init(model) { };

    updateStatus(model, newStatus) {
        this.status = newStatus;
    }

    removeInConn(id) {
        this.inConns.splice(this.inConns.indexOf(id), 1);
    };

    removeOutConn(id) {
        this.outConns.splice(this.outConns.indexOf(id), 1);
    };

    withinRange(anotherStruct) {
        return this.range * this.range >= utils.distance_raw(this.xCoord, this.yCoord, anotherStruct.xCoord, anotherStruct.yCoord);
    };

    distanceTo(anotherStruct) {
        return utils.distance(this.xCoord, this.yCoord, anotherStruct.xCoord, anotherStruct.yCoord);
    };

    pointInRange(x, y) {
        return this.range * this.range >= utils.distance_raw(this.xCoord, this.yCoord, x, y);
    };

    distanceToPoint(x, y) {
        return utils.distance(this.xCoord, this.yCoord, x, y);
    };

    getQueryDesc() {
        let desc = [
            `${this.constructor.name}`,
            `Status: ${getEnumString(StructureStatus, this.status)}`,
            `Pos: (${this.xCoord}, ${this.yCoord})`,
            `Range: ${this.range}`,
            `In: ${this.inConns.length}/${this.maxInConns}`,
            `Out: ${this.outConns.length}/${this.maxOutConns}`,
            `Currency: ${this.currency}`
        ];
        if (this.status === StructureStatus.BUILDING) {
            desc.push(`Build progress: ${this.buildProgress}/${this.buildCost}`);
        }
        return desc;
    };

}

function getEnumString(enumObj, value) {
    for (let prop of Object.keys(enumObj)) {
        if (enumObj[prop] === value) {
            return prop;
        }
    }
    return "";
}

module.exports = { Structure, StructureStatus };