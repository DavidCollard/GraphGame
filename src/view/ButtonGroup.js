const UIElement = require('./UIElement').UIElement;
const CanvasButton = require('./CanvasButton').CanvasButton;

const ExtendDir = {
    HORIZONTAL: 0,
    VERTICAL: 1
};

class ButtonGroup extends UIElement {
    constructor(x, y, extendDir) {
        super();
        this.x = x;
        this.y = y;
        this.visible = true;
        this.extendDir = extendDir;
        this.width = 0;
        this.height = 0;
        this.buttons = [];
    };

    addButton(width, height, clickEvent, labelF, visible) {
        const x = this.x + (this.extendDir === ExtendDir.HORIZONTAL ? this.width : 0);
        const y = this.y + (this.extendDir !== ExtendDir.HORIZONTAL ? this.height : 0);
        
        if (this.extendDir === ExtendDir.HORIZONTAL) {
            this.width += width;
            this.height = Math.max(this.height, height);
        } else {
            this.height += height;
            this.width = Math.max(this.width, width);
        }
        
        this.buttons.push(
            new CanvasButton(x, y, width, height, clickEvent, labelF, visible)
        );
    };

    draw(ctx) {
        for (let button of this.buttons) {
            button.draw(ctx);
        }
    };

    isClicked(x, y) {
        return this.visible && x > this.x && y > this.y && x < this.x + this.width && y < this.y + this.height;
    };

    click(e, x, y) {
        for (let button of this.buttons) {
            if (button.isClicked(x, y)) {
                button.click(e, x, y);
                break;
            }
        }
    }
};

module.exports = { ButtonGroup, ExtendDir };