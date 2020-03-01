const utils = require('../Utils/coordinateUtils');

class GameCanvasView {
    constructor(containerName, controller) {
        this.controller = controller;

        // meta
        this.gameCanvas = document.getElementById(containerName);
        this.gcctx = this.gameCanvas.getContext("2d");

        // canvas dims/pos
        this.offsetX;
        this.offsetY;
        this.canvasWidth;
        this.canvasHeight;
        this.tilePxLen = 40;

        // dragging/positioning variables
        this.isDragging = false;
        this.globalX = 0;
        this.globalY = 0;
        this.localX = 0;
        this.localY = 0;
        this.clickStartX;
        this.clickStartY;
        this.currMouseX;
        this.currMouseY;
        this.drawCoordinates = false;
        this.lastFrame = new Date() - 1000;

        this.init(containerName);
    }

    calculateCanvasDims() {
        const rect = this.gameCanvas.parentNode.getBoundingClientRect();
        this.gameCanvas.width = rect.width;
        this.gameCanvas.height = rect.height;
        this.offsetX = this.gameCanvas.offsetLeft;
        this.offsetY = this.gameCanvas.offsetTop;
        this.canvasWidth = this.gameCanvas.width;
        this.canvasHeight = this.gameCanvas.height;
        this.isDragging = false;
        this.drawBoard(true);
    }

    moveCamera(xCoord, yCoord, tilePxLen = this.tilePxLen, height = this.canvasHeight, width = this.canvasWidth) {
        const hmidOffset = width / 2;
        const vmidOffset = height / 2;
        const xPx = -xCoord * tilePxLen + hmidOffset;
        const yPx = -yCoord * tilePxLen + vmidOffset;
        this.globalX = xPx;
        this.globalY = yPx;
        this.drawBoard(true);
    }

    drawAnimatedElements(forceUpdate = false) {
        let now = new Date();

        if (!forceUpdate && now - this.lastFrame < 16) {
            return;
        }
        const globalX = this.globalX;
        const globalY = this.globalY;
        const localX = this.localX;
        const localY = this.localY;
        const tilePxLen = this.tilePxLen;
        const canvasHeight = this.canvasHeight;
        const canvasWidth = this.canvasWidth;
        let ctx = this.gcctx;

        const minX = Math.floor((-globalX - localX) / tilePxLen);
        const minY = Math.floor((-globalY - localY) / tilePxLen);
        const maxX = minX + (canvasWidth / tilePxLen) + 1;
        const maxY = minY + (canvasHeight / tilePxLen) + 1;

        const model = this.controller.getModel();

        let queryChildren = model.selectedChildren;
        let queryAncestors = model.selectedAncestors;

        for (let src in model.conns) {
            for (let sink in model.conns[src]) {

                const srcStruct = model.nodes[src];
                const sinkStruct = model.nodes[model.conns[src][sink]];

                const [srcCX, srcCY] = [srcStruct.xCoord, srcStruct.yCoord];
                const [sinkCX, sinkCY] = [sinkStruct.xCoord, sinkStruct.yCoord];

                // culling logic for lines
                let dontCull = false
                // check if in viewbox
                dontCull |= (srcCX >= minX && srcCX <= maxX && srcCY >= minY && srcCY <= maxY);
                dontCull |= (sinkCX >= minX && sinkCX <= maxX && sinkCY >= minY && sinkCY <= maxY);

                if (!dontCull) {
                    // check if both points in same horizontal or vertical region outside of viewbox
                    if ((srcCX > maxX && sinkCX > maxX) ||
                        (srcCX < minX && sinkCX < minX) ||
                        (srcCY > maxY && sinkCY > maxY) ||
                        (srcCY < minY && sinkCY < minY)
                    ) {
                        continue;
                    }

                    // check if points outside of viewbox have a line intersecting the viewbox
                    const slope = (srcCY - sinkCY) / (srcCX - sinkCX);
                    const intLeft = minX * slope;
                    dontCull |= (intLeft >= minY && intLeft <= maxY);
                    const intRight = maxX * slope;
                    dontCull |= (intRight >= minY && intRight <= maxY);
                    const intTop = minY / slope;
                    dontCull |= (intTop >= minX && intTop <= maxX);
                    const intBot = maxY / slope;
                    dontCull |= (intBot >= minX && intBot <= maxX);

                    if (!dontCull) {
                        continue;
                    }
                }

                let { pxX: srcX, pxY: srcY } = utils.calcCanvasXY(tilePxLen, srcCX, srcCY, globalX + localX, globalY + localY);
                let { pxX: sinkX, pxY: sinkY } = utils.calcCanvasXY(tilePxLen, sinkCX, sinkCY, globalX + localX, globalY + localY);

                //center
                srcX += 0.5 * tilePxLen;
                srcY += 0.5 * tilePxLen;
                sinkX += 0.5 * tilePxLen;
                sinkY += 0.5 * tilePxLen;

                let isAncestor = queryAncestors.includes(sinkStruct.id); // then both src and sink are ancestors 
                let isChild = queryChildren.includes(srcStruct.id);      // then both src and sink are children

                if (isAncestor && isChild) {
                    ctx.strokeStyle = "green";
                }
                else if (isAncestor) {
                    ctx.strokeStyle = "blue";
                }
                else if (isChild) {
                    ctx.strokeStyle = "yellow";
                }
                else {
                    ctx.strokeStyle = "grey";
                }

                // line
                ctx.beginPath();
                ctx.lineWidth = 3;
                ctx.moveTo(srcX, srcY);
                ctx.lineTo(sinkX, sinkY);
                ctx.stroke();
                ctx.closePath();

                const len = utils.distance(srcX / tilePxLen, srcY / tilePxLen, sinkX / tilePxLen, sinkY / tilePxLen);
                const percent = (now % (len * 1000)) / (len * 1000);

                // packet
                ctx.beginPath();
                ctx.strokeStyle = "red";
                ctx.lineWidth = 3;
                if (percent < 0.9) {
                    ctx.moveTo(
                        srcX + (sinkX - srcX) * percent,
                        srcY + (sinkY - srcY) * percent
                    );
                    ctx.lineTo(
                        srcX + (sinkX - srcX) * (percent + 0.1),
                        srcY + (sinkY - srcY) * (percent + 0.1)
                    );
                }

                ctx.stroke();
                ctx.closePath();
            }
        }
    }

    drawBoard(forceUpdate = false) {
        const model = this.controller.getModel();

        let now = new Date();

        if (!forceUpdate && now - this.lastFrame < 16) {
            return;
        }

        const globalX = this.globalX;
        const globalY = this.globalY;
        const localX = this.localX;
        const localY = this.localY;
        const tilePxLen = this.tilePxLen;
        const canvasHeight = this.canvasHeight;
        const canvasWidth = this.canvasWidth;
        let ctx = this.gcctx;

        ctx.beginPath();
        ctx.clearRect(0, 0, canvasWidth, canvasHeight);

        const draggedOffsetX = (globalX + localX) % tilePxLen;
        const draggedOffsetY = (globalY + localY) % tilePxLen;

        const coordX = Math.floor((-globalX - localX) / tilePxLen);
        const coordY = Math.floor((-globalY - localY) / tilePxLen);

        // gridlines
        ctx.lineWidth = 1;
        for (let x = 0.5; x <= canvasWidth + tilePxLen; x += tilePxLen) {
            ctx.moveTo(x + draggedOffsetX, 0);
            ctx.lineTo(x + draggedOffsetX, canvasHeight);
        }

        for (let y = 0.5; y <= canvasHeight + tilePxLen; y += tilePxLen) {
            ctx.moveTo(0, y + draggedOffsetY);
            ctx.lineTo(canvasWidth, y + draggedOffsetY);
        }
        ctx.strokeStyle = "#000";
        ctx.stroke();
        ctx.closePath();

        // grid contents
        for (var x = 0; x <= (canvasWidth / tilePxLen) + 1; x++) {
            for (var y = 0; y <= (canvasHeight / tilePxLen) + 1; y++) {
                // coordinate text
                if (this.drawCoordinates && (x + coordX) % 5 == 0 && (y + coordY) % 5 == 0) {
                    // negative offset rolls in opposite direction
                    const negOffsetX = coordX < 0 && draggedOffsetX % tilePxLen != 0 ? 1 : 0;
                    const negOffsetY = coordY < 0 && draggedOffsetY % tilePxLen != 0 ? 1 : 0;

                    ctx.fillText(
                        `${x + coordX}, ${y + coordY}`,
                        draggedOffsetX + (x - negOffsetX) * tilePxLen + 0.2 * tilePxLen,
                        draggedOffsetY + (y - negOffsetY) * tilePxLen + 0.6 * tilePxLen
                    );
                }
                const { pxX, pxY } = utils.calcCanvasXY(tilePxLen, x + coordX, y + coordY, globalX + localX, globalY + localY);
                model.drawTile(x + coordX, y + coordY, pxX, pxY, tilePxLen, ctx);
            }
        }

        if (model.isValidId(model.CONNECT)) {
            const struct = model.nodes[model.CONNECT];
            const [arcX, arcY] = [struct.xCoord, struct.yCoord];

            let { pxX, pxY } = utils.calcCanvasXY(tilePxLen, arcX, arcY, globalX + localX, globalY + localY);

            // center it
            pxX += 0.5 * tilePxLen;
            pxY += 0.5 * tilePxLen;

            ctx.beginPath();
            ctx.moveTo(this.currMouseX, this.currMouseY);
            ctx.lineTo(pxX, pxY);
            ctx.stroke();
            ctx.closePath();
        }
        this.drawAnimatedElements(forceUpdate);
        this.lastFrame = new Date();
    }

    calcCoordinate(xPx, yPx) {
        return utils.calcCoordinate(this.tilePxLen, this.globalX + this.localX, this.globalY + this.localY, xPx, yPx);
    }

    handleMouseDown(e) {
        const canMouseX = parseInt(e.clientX - this.offsetX);
        const canMouseY = parseInt(e.clientY - this.offsetY);

        if (e.button === 0) // left mouse
        {
            const { coordX, coordY } = this.calcCoordinate(canMouseX, canMouseY);
            this.currMouseX = canMouseX;
            this.currMouseY = canMouseY;

            this.controller.evtXYClick(coordX, coordY);

            this.drawBoard();
        }

        if (e.button === 1 || e.button === 2) // middle mouse
        {
            // view-only event
            this.clickStartX = canMouseX;
            this.clickStartY = canMouseY;
            this.isDragging = true;
        }
    }

    handleMouseUp(e) {
        const canMouseX = parseInt(e.clientX - this.offsetX);
        const canMouseY = parseInt(e.clientY - this.offsetY);

        if (e.button === 0) {
            const coordX = Math.floor((canMouseX - (this.globalX + this.localX)) / this.tilePxLen);
            const coordY = Math.floor((canMouseY - (this.globalY + this.localY)) / this.tilePxLen);

            this.controller.evtDragUp(coordX, coordY);

            this.drawBoard(true);
        }

        if (e.button === 1 || e.button === 2) {
            this.globalX += this.localX;
            this.globalY += this.localY;
            this.localX = 0;
            this.localY = 0;
        }

        // clear the drag flag
        this.drawBoard(true);
        this.isDragging = false;
    }

    handleMouseOut(e) {
        const canMouseX = parseInt(e.clientX - this.offsetX);
        const canMouseY = parseInt(e.clientY - this.offsetY);

        this.globalX += this.localX;
        this.globalY += this.localY;
        this.localX = 0;
        this.localY = 0;

        // user has left the canvas, so clear the drag flag
        this.drawBoard(true);
        this.isDragging = false;
    }

    handleMouseMove(e) {
        const canMouseX = parseInt(e.clientX - this.offsetX);
        const canMouseY = parseInt(e.clientY - this.offsetY);

        // if the drag flag is set, clear the canvas and draw the image
        if (this.isDragging) {
            this.localX = (canMouseX - this.clickStartX);
            this.localY = (canMouseY - this.clickStartY);
            this.drawBoard();
        }

        const model = this.controller.getModel();
        if (model.isValidId(model.CONNECT)) {
            this.currMouseX = canMouseX;
            this.currMouseY = canMouseY;
            this.drawBoard(true);
        }
    }

    onwheel(e) {
        // prior middle cell
        const { coordX, coordY } = this.calcCoordinate(this.canvasWidth / 2, this.canvasHeight / 2);
        if (e.deltaY > 0) {
            this.tilePxLen = Math.max(this.tilePxLen - 5, 20);
        } else if (e.deltaY < 0) {
            this.tilePxLen = Math.min(this.tilePxLen + 5, 80);
        }
        this.moveCamera(coordX, coordY);
    }

    handleKeyDown(e) {
        if (e.key === ' ') {
            this.tilePxLen = 40;
            this.moveCamera(0, 0);
            this.drawBoard();
        }
    }

    handleReset(e) {
        const model = this.controller.getModel();
        model.reset();
        this.calculateCanvasDims();
        this.moveCamera(0, 0);
    }

    handleResize(e) {
        this.gameCanvas.width = 0;
        this.gameCanvas.height = 0;
        this.calculateCanvasDims();
    }

    init() {

        this.calculateCanvasDims();
        this.moveCamera(0, 0); //calls drawBoard, which is bad because calculatecanvasdims does this already...

        let canvas = this.gameCanvas;

        this.onmousedown = (e) => { return this.handleMouseDown(e); };
        this.onmousemove = (e) => { this.handleMouseMove(e) };
        this.onmouseup = (e) => { this.handleMouseUp(e) };
        this.onmouseout = (e) => { this.handleMouseOut(e) };
        this.onkeydown = (e) => { this.handleKeyDown(e) };
        canvas.oncontextmenu = () => { return false; }; // disable right click menu

        let reset = document.getElementById('reset');
        reset.onclick = (e) => { this.handleReset(e) };

        this.onresize = (e) => { this.handleResize(e) };
    }
}

module.exports = { GameCanvasView };