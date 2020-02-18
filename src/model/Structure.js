const utils = require('../coordinateUtils');

const StructureStatus = {
    ACTIVE: 0,
    INACTIVE: 1
};

class Structure {
    constructor(id, xCoord, yCoord, range, maxInConns, maxOutConns) {
        this.id = id;
        this.status = StructureStatus.ACTIVE;
        this.xCoord = xCoord;
        this.yCoord = yCoord;
        this.inConns = [];    //list of id's
        this.outConns = [];   //list of id's
        this.range = range;   //maximum euclidian distance for a connection
        this.maxInConns = maxInConns;
        this.maxOutConns = maxOutConns;
    };

    // pxX/pxY indicate the top left corner of the cell to be drawn
    // dim is the dimension of the square sprite to be drawn
    // ctx is the canvas context for the draw
    draw(pxX, pxY, dim, ctx, bgColour) {
        ctx.beginPath();

        // ctx.fillStyle = '#90EE90';
        ctx.fillStyle = bgColour;
        ctx.fillRect(pxX + 1, pxY + 1, dim - 1, dim - 1);

        ctx.arc(
            pxX + 0.5 * dim,
            pxY + 0.5 * dim,
            dim * 0.25,
            0,
            2 * Math.PI
        );

        ctx.strokeStyle = "#000";
        ctx.stroke();

        ctx.closePath();
    };

    deactivate() {
        this.status = StructureStatus.INACTIVE;
    };

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
        // console.log(`${x}, ${y}, ${this.xCoord}, ${this.yCoord} -> ${utils.distance_raw(this.xCoord, this.yCoord, x, y)}`)
        return this.range * this.range >= utils.distance_raw(this.xCoord, this.yCoord, x, y);
    };

    distanceToPoint(x, y) {
        return utils.distance(this.xCoord, this.yCoord, x, y);
    };

    getQueryDesc() {
        return [`${this.xCoord}, ${this.yCoord}`, `range: ${this.range}`];
    };
}

module.exports = { Structure, StructureStatus };