const Structure = require('./Structure').Structure;

class CommandNode extends Structure {
    constructor(id, xCoord, yCoord) {
        const range = 10;
        const maxInConns = 10;
        const maxOutConns = 5;
        super(id, xCoord, yCoord, range, maxInConns, maxOutConns);
    }
};

module.exports = { CommandNode };