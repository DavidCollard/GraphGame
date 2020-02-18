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
    }

    draw(forceUpdate = false) {
        // console.log('drawing UI');
        this.controller.getModel();
        let ctx = this.uictx;
        let width = this.uiCanvas.width;
        let height = this.uiCanvas.height;

        for (let id in this.uiElements) {
            let element = this.uiElements[id];
            element.draw(ctx);
        }

    }

    calculateCanvasDims() {
        const rect = this.uiCanvas.parentNode.getBoundingClientRect();
        this.uiCanvas.width = rect.width;
        this.uiCanvas.height = rect.height;

        // this.uiCanvas.style.bottom = '0px';

        this.offsetX = this.uiCanvas.offsetLeft;
        this.offsetY = this.uiCanvas.offsetTop;
        this.canvasWidth = this.uiCanvas.width;
        this.canvasHeight = this.uiCanvas.height;
    }

    handleResize(e) {
        this.calculateCanvasDims();
        this.initButtons();
        this.draw();
    }

    isClicked(e) {
        const mouseX = parseInt(e.clientX - this.offsetX);
        const mouseY = parseInt(e.clientY - this.offsetY);
        return mouseX >= 0 && mouseX <= this.canvasWidth && mouseY >= 0 && mouseY <= this.canvasHeight;
    }

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
    }

    onwheel(e) {
        return true;
    }

    handleKeyDown(e) {
        if (e.key === 'q') {
            this.controller.evtChangeClickAction(ClickAction.QUERY);
        }
        else if (e.key === 'w') {
            this.controller.evtChangeClickAction(ClickAction.STRUCT);
        }
        else if (e.key === 'e') {
            this.controller.evtChangeClickAction(ClickAction.DELETE);
        }
        this.draw();
        return true;
    }

    initButtons() {

        this.uiElements = [];

        let canvas = this.uiCanvas;
        let controller = this.controller;
        
        const buttonH = 50;
        const buttonW = 50;
        const defaultActive = '#90EE90';
        const defaultSelected = '#42b3f5';

        /*
        const menuGroup = new ButtonGroup(
            (canvas.width - buttonW) / 2,
            canvas.height - buttonH * 1.5,
            ExtendDir.HORIZONTAL
        );
        */
        
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
                    text: ["# of nodes", controller.getModel().nodes.length - controller.getModel().deadNodes.length],
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
        // currency
        menuGroup.addButton(
            buttonW,
            buttonH,
            (e) => { },
            () => {
                return {
                    text: ["Currency", controller.getModel().currency],
                    colour: defaultActive
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
                        return { text: struct.getQueryDesc(), colour: defaultActive };
                    }
                    this.visible = false;
                    return { text: [], colour: defaultActive };
                },
                false
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

        // let reset = document.getElementById('reset');
        // reset.onclick = (e) => { this.handleReset(e) };

        this.onresize = (e) => { this.handleResize(e) };
    }
}

module.exports = { UICanvasView }