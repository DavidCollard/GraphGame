const Structure = require('./Structure').Structure;

class Farm extends Structure {
    constructor(id, xCoord, yCoord) {
        const range = 5;
        const maxInConns = 3;
        const maxOutConns = 2;
        super(id, xCoord, yCoord, range, maxInConns, maxOutConns);
    }
};

module.exports = { Farm };