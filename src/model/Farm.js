const { Structure, StructureStatus } = require('./Structure');

class Farm extends Structure {
    constructor(id, xCoord, yCoord) {
        const range = 5;
        const maxInConns = 3;
        const maxOutConns = 2;
        const buildCost = 5;
        super(id, xCoord, yCoord, range, maxInConns, maxOutConns, buildCost);

        this.tileOutput = 0;
    };

    init(model) {
        super.init();
    };

    updateStatus(model, newStatus) {
        let oldStatus = this.status;
        super.updateStatus(model, newStatus);

        if (oldStatus === StructureStatus.BUILDING && this.status === StructureStatus.ACTIVE) {
            const range = this.range;
            for (let offsetX = -range; offsetX < range; offsetX++) {
                for (let offsetY = -range; offsetY < range; offsetY++) {
                    if (this.pointInRange(this.xCoord + offsetX, this.yCoord + offsetY)) {
                        this.calcAddFarmTile(this.xCoord + offsetX, this.yCoord + offsetY, model);
                    }
                }
            }
        }
        else if (oldStatus === StructureStatus.ACTIVE && this.status === StructureStatus.INACTIVE) {
            const range = this.range;
            for (let offsetX = -range; offsetX < range; offsetX++) {
                for (let offsetY = -range; offsetY < range; offsetY++) {
                    if (this.pointInRange(this.xCoord + offsetX, this.yCoord + offsetY)) {
                        this.calcRemoveFarmTile(this.xCoord + offsetX, this.yCoord + offsetY, model);
                    }
                }
            }
        }
    }

    gameTick(model) {
        if (this.status === StructureStatus.ACTIVE) {
            this.pendingCurrency += Math.floor(this.tileOutput);
        }
        super.gameTick(model);
    };

    calcAddFarmTile(x, y, model) {
        let factor = 0.0;
        let farmsInRange = [];
        for (let tmpStruct of model.nodes) {
            if (tmpStruct.status === StructureStatus.ACTIVE && tmpStruct != this && tmpStruct instanceof Farm && tmpStruct.pointInRange(x, y)) {
                const dist = tmpStruct.distanceToPoint(x, y);
                factor += (tmpStruct.range - dist) / tmpStruct.range;
                farmsInRange.push(tmpStruct);
            }
        }
        // deallocate
        for (let tmpStruct of farmsInRange) {
            const dist = tmpStruct.distanceToPoint(x, y);
            const amt = (tmpStruct.range - dist) / tmpStruct.range;
            tmpStruct.tileOutput -= factor === 0 ? 0 : (amt / factor) * Math.min(factor, 1); // proportionate contribution to factor
        }
        // allocate
        const structAmt = (this.range - this.distanceToPoint(x, y)) / this.range;
        factor += structAmt;
        this.tileOutput += factor === 0 ? 0 : (structAmt / factor) * Math.min(factor, 1);
        for (let tmpStruct of farmsInRange) {
            const dist = tmpStruct.distanceToPoint(x, y);
            const amt = (tmpStruct.range - dist) / tmpStruct.range;
            tmpStruct.tileOutput += factor === 0 ? 0 : (amt / factor) * Math.min(factor, 1); // proportionate contribution to factor
        }
    };

    calcRemoveFarmTile(x, y, model) {
        let factor = 0.0;
        let structFactor = 0.0;
        let farmsInRange = [];
        for (let tmpStruct of model.nodes) {
            if ((tmpStruct.status === StructureStatus.ACTIVE || tmpStruct === this) && tmpStruct instanceof Farm && tmpStruct.pointInRange(x, y)) {
                const dist = tmpStruct.distanceToPoint(x, y);
                factor += (tmpStruct.range - dist) / tmpStruct.range;
                if (tmpStruct === this) {
                    structFactor = (tmpStruct.range - dist) / tmpStruct.range;
                }
                else {
                    farmsInRange.push(tmpStruct);
                }
            }
        }
        // deallocate
        for (let tmpStruct of farmsInRange) {
            const dist = tmpStruct.distanceToPoint(x, y);
            const amt = (tmpStruct.range - dist) / tmpStruct.range;
            tmpStruct.tileOutput -= factor === 0 ? 0 : (amt / factor) * Math.min(factor, 1); // proportionate contribution to factor
        }
        factor -= structFactor;
        // allocate
        for (let tmpStruct of farmsInRange) {
            const dist = tmpStruct.distanceToPoint(x, y);
            const amt = (tmpStruct.range - dist) / tmpStruct.range;
            tmpStruct.tileOutput += factor === 0 ? 0 : (amt / factor) * Math.min(factor, 1); // proportionate contribution to factor
        }
    };

    getQueryDesc() {
        let desc = super.getQueryDesc();
        desc.push(`Farm output: ${Math.floor(this.tileOutput)}`);
        return desc;
    };
};

module.exports = { Farm };