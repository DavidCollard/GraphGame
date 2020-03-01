const { Structure, StructureStatus } = require('./Structure');

class CommandNode extends Structure {
    constructor(id, xCoord, yCoord) {
        const range = 10;
        const maxInConns = 10;
        const maxOutConns = 5;
        const buildCost = 1;
        super(id, xCoord, yCoord, range, maxInConns, maxOutConns, buildCost);
        this.acceptCurrency(1);
    };

    gameTick(model) {
        if (this.status === StructureStatus.ACTIVE) {
            this.pendingCurrency += 10;
        }
        super.gameTick(model);
    };

    getQueryDesc() {
        let desc = super.getQueryDesc();
        desc.push(`Passive output: 10`);
        return desc;
    };
};

module.exports = { CommandNode };