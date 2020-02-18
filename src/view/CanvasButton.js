const UIElement = require('./UIElement').UIElement;

class CanvasButton extends UIElement {
    constructor(x, y, width, height, clickEvent, labelF, visible) {
        super();
        this.x = x; // x,y of top left
        this.y = y;
        this.width = width;
        this.height = height;
        this.labelF = labelF;
        this.clickEvent = clickEvent;
        this.visible = visible;
    }

    isClicked(x, y) {
        return this.visible && x > this.x && y > this.y && x < this.x + this.width && y < this.y + this.height;
    }

    click(e, x, y) {
        this.clickEvent(e);
    }

    draw(ctx) {

        let { text: labels, colour } = this.labelF();
        if (!this.visible) {
            ctx.clearRect(this.x - 1, this.y - 1, this.width + 2, this.height + 2);
            ctx.stroke();
            return;
        }
        ctx.strokeStyle = '#000000';
        ctx.rect(this.x, this.y, this.width, this.height);
        ctx.fillStyle = colour;//'#90EE90';
        ctx.fill();
        ctx.stroke();
        ctx.closePath();
        ctx.beginPath();
        ctx.strokeStyle = '#000000';
        ctx.fillStyle = '#000000';
        ctx.textAlign = 'center';
        ctx.font = '11px FontAwesome';
        let vert = 0;
        for (let line of labels) {
            ctx.fillText(
                line,
                this.x + this.width / 2,
                this.y + this.height / 4 + vert
            );
            vert += this.height / 4;
        }
        ctx.stroke();
    }
};

module.exports = { CanvasButton };