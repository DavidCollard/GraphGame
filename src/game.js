const Model = require('./model/Model').Model;
const GameController = require('./controller/GameController').GameController;
const GameCanvasView = require('./view/GameCanvas').GameCanvasView;
const UICanvasView = require('./view/UICanvas').UICanvasView;

function startup() {
    let model = new Model();
    let gameController = new GameController(model);
    let gameCanvasView = new GameCanvasView("game_canvas", gameController);
    let uiCanvasView = new UICanvasView("ui_canvas", gameController);

    const gameDelay = 1000;
    var tmpGameDelay = gameDelay;
    var lastGameUpdate = Date.now();

    const gameLoop = () => {
        setTimeout(() => {
            let now = Date.now();
            let actual = now - lastGameUpdate;
            tmpGameDelay = gameDelay - (actual - tmpGameDelay);
            lastGameUpdate = now;
            gameController.gameTick();
            gameController.updateSubscribers();
            gameLoop();
        }, tmpGameDelay);
    };
    gameLoop();

    const drawDelay = 50;
    var tmpDrawDelay = drawDelay;
    var lastDrawUpdate = Date.now();

    const drawLoop = () => {
        setTimeout(() => {
            let now = Date.now();
            let actual = now - lastDrawUpdate;
            tmpDrawDelay = drawDelay - (actual - tmpDrawDelay);
            lastDrawUpdate = now;
            gameCanvasView.drawBoard(true);
            drawLoop();
        }, tmpDrawDelay);
    };
    drawLoop();

    window.onmousedown = (e) => {
        if (!uiCanvasView.isClicked(e)) {
            return;
        }
        let res = uiCanvasView.onmousedown(e);
        if (res) {
            gameCanvasView.onmousedown(e);
        }
    }

    window.onmousemove = (e) => {
        if (!uiCanvasView.isClicked(e)) {
            return;
        }
        let res = uiCanvasView.onmousemove(e);
        if (res) {
            gameCanvasView.onmousemove(e);
        }
    }

    window.onmouseup = (e) => {
        if (!uiCanvasView.isClicked(e)) {
            return;
        }
        let res = uiCanvasView.onmouseup(e);
        if (res) {
            gameCanvasView.onmouseup(e);
        }
    }

    window.onmouseout = (e) => {
        if (!uiCanvasView.isClicked(e)) {
            return;
        }
        let res = uiCanvasView.onmouseout(e);
        if (res) {
            gameCanvasView.onmouseout(e);
        }
    }

    //TODO: non-chrome support
    window.onwheel = (e) => {
        let res = uiCanvasView.onwheel(e);
        if (res) {
            gameCanvasView.onwheel(e);
        }
    }

    window.onkeydown = (e) => {
        let res = uiCanvasView.onkeydown(e);
        if (res) {
            gameCanvasView.onkeydown(e);
        }
    }

    window.onresize = (e) => {
        uiCanvasView.onresize(e);
        gameCanvasView.onresize(e);
    }
}

window.onload = startup;