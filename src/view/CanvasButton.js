const UIElement = require('./UIElement').UIElement;
const StringUtils = require('../Utils/StringUtils');

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

        if (!this.visible) { return; }

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
        const lineHeight = 15;
        let vert = 0;
        for (let line of labels) {
            const subLines = StringUtils.StringToLines(line, this.width - 10, ctx);
            if (subLines.length * lineHeight + vert > this.height) { break; }
            for (const subline of subLines) {
                ctx.fillText(
                    subline,
                    this.x + this.width / 2,
                    this.y + lineHeight + vert
                );
                vert += lineHeight;
            }
        }
        ctx.stroke();
    }
};

module.exports = { CanvasButton };