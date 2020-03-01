const ClickAction = require('../model/Model').ClickAction;
const CanvasButton = require('./CanvasButton').CanvasButton;
const { ButtonGroup, ExtendDir } = require('./ButtonGroup');

class UICanvasView {
    constructor(containerName, controller) {
        this.controller = controller;

        this.uiCanvas = document.getElementById(containerName);
        this.uictx = this.uiCanvas.getContext("2d");
        this.uiElements = [];
        this.init();
    };

    draw(forceUpdate = false) {
        this.controller.getModel();
        let ctx = this.uictx;
        let width = this.uiCanvas.width;
        let height = this.uiCanvas.height;

        ctx.clearRect(0, 0, width, height);
        ctx.stroke();

        for (let element of this.uiElements) {
            element.draw(ctx);
        }

    };

    calculateCanvasDims() {
        const rect = this.uiCanvas.parentNode.getBoundingClientRect();
        this.uiCanvas.width = rect.width;
        this.uiCanvas.height = rect.height;

        this.offsetX = this.uiCanvas.offsetLeft;
        this.offsetY = this.uiCanvas.offsetTop;
        this.canvasWidth = this.uiCanvas.width;
        this.canvasHeight = this.uiCanvas.height;
    };

    handleResize(e) {
        this.calculateCanvasDims();
        this.initButtons();
        this.draw();
    };

    isClicked(e) {
        const mouseX = parseInt(e.clientX - this.offsetX);
        const mouseY = parseInt(e.clientY - this.offsetY);
        return mouseX >= 0 && mouseX <= this.canvasWidth && mouseY >= 0 && mouseY <= this.canvasHeight;
    };

    handleMouseDown(e) {
        const mouseX = parseInt(e.clientX - this.offsetX);
        const mouseY = parseInt(e.clientY - this.offsetY);
        let clicked = false;

        for (let button of this.uiElements) {
            if (button.isClicked(mouseX, mouseY)) {
                button.click(e, mouseX, mouseY);
                clicked = true;
                break;
            }
        }

        return !clicked;
    };

    onwheel(e) {
        return true;
    };

    handleKeyDown(e) {
        if (e.key === 'q' || e.key === 'Q') {
            this.controller.evtChangeClickAction(ClickAction.QUERY);
        }
        else if (e.key === 'w' || e.key === 'W') {
            this.controller.evtChangeClickAction(ClickAction.STRUCT);
        }
        else if (e.key === 'e' || e.key === 'E') {
            this.controller.evtChangeClickAction(ClickAction.DELETE);
        }
        this.draw();
        return true;
    };

    initButtons() {

        this.uiElements = [];

        let canvas = this.uiCanvas;
        let controller = this.controller;

        const buttonH = 50;
        const buttonW = 50;
        const defaultActive = '#90EE90';
        const defaultSelected = '#42b3f5';

        const menuGroup = new ButtonGroup(
            canvas.width - buttonW * 1.5,
            (canvas.height - buttonH) / 2,
            ExtendDir.VERTICAL
        );

        this.uiElements.push(menuGroup);
        // node #
        menuGroup.addButton(
            buttonH,
            buttonW,
            (e) => { },
            () => {
                return {
                    text: ["# of nodes", (controller.getModel().nodes.length - controller.getModel().deadNodes.length).toString()],
                    colour: defaultActive
                }
            },
            true
        );
        // query
        menuGroup.addButton(
            buttonW,
            buttonH,
            (e) => { controller.evtChangeClickAction(ClickAction.QUERY); },
            () => {
                return {
                    text: ["\uf002", "Query"],
                    colour: controller.getModel().clickAction === ClickAction.QUERY ? defaultSelected : defaultActive
                }
            },
            true
        );
        // struct
        menuGroup.addButton(
            buttonW,
            buttonH,
            (e) => { controller.evtChangeClickAction(ClickAction.STRUCT); },
            () => {
                return {
                    text: ["\uf055", "Struct"],
                    colour: controller.getModel().clickAction === ClickAction.STRUCT ? defaultSelected : defaultActive
                }
            },
            true
        );
        //delete
        menuGroup.addButton(
            buttonW,
            buttonH,
            (e) => { controller.evtChangeClickAction(ClickAction.DELETE); },
            () => {
                return {
                    text: ["\uf014", "Delete"],
                    colour: controller.getModel().clickAction === ClickAction.DELETE ? defaultSelected : defaultActive
                }
            },
            true
        );
        // query panel
        this.uiElements.push(
            new CanvasButton(
                10,
                10,
                buttonW * 2,
                buttonH * 2,
                (e) => { },
                function () {
                    const model = controller.getModel();
                    const id = model.selectedNode;
                    if (model.isValidId(id)) {
                        this.visible = true;
                        const struct = model.getStructure(id);
                        const text = struct.getQueryDesc();
                        this.height = text.length * 15 + 10;
                        return { text: text, colour: defaultActive };
                    }
                    this.visible = false;
                    return { text: [], colour: defaultActive };
                },
                false
            )
        );
        const lineHeight = 15;
        const messageLogHeight = 20 + 5 * lineHeight;
        const messageLogWidth = 500;
        // Message log
        this.uiElements.push(
            new CanvasButton(
                this.canvasWidth - 10 - messageLogWidth,
                10,
                messageLogWidth,
                messageLogHeight,
                function (e) { this.height = this.height === messageLogHeight ? 20 : messageLogHeight; },
                function () {
                    let messages = controller.getModel().messages.slice(0);
                    if (messages.length > (this.height - 20) / lineHeight) {
                        messages = messages.slice(messages.length - (this.height - 20) / lineHeight, messages.length);
                    }
                    return { text: ['Message Log', ...messages.reverse()], colour: defaultActive };
                },
                true
            )
        );
    };

    init() {
        this.calculateCanvasDims();

        let canvas = this.uiCanvas;
        let controller = this.controller;

        let uiCanvas = this;
        controller.subscribe(() => { uiCanvas.draw() });

        this.initButtons();

        this.draw();

        this.onmousedown = (e) => { return this.handleMouseDown(e) };
        this.onmousemove = (e) => { return true;/*this.handleMouseMove(e)*/ };
        this.onmouseup = (e) => { return true;/*this.handleMouseUp(e)*/ };
        this.onmouseout = (e) => { return true;/*this.handleMouseOut(e)*/ };
        this.onkeydown = (e) => { return this.handleKeyDown(e) };
        canvas.oncontextmenu = () => { return false; }; // disable right click menu

        this.onresize = (e) => { this.handleResize(e) };
    };
};

module.exports = { UICanvasView };