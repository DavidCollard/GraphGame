// calculates a pixel coordinate from logical coordinates
// tilePxLen - tile dim
// mX/Y      - logical model
// offX/Y    - current px offset
function calcCanvasXY(tilePxLen, mX, mY, offX, offY) {
    let pxX = mX * tilePxLen + offX;
    let pxY = mY * tilePxLen + offY;
    return { pxX, pxY };
}

// calculates a logical coordinate from pixel coordinates
// tilePxLen - tile dim
// offsetX/Y - net screen scroll
// pointX/Y  - query point
function calcCoordinate(tilePxLen, offsetX, offsetY, pointX, pointY) {
    let coordX = Math.floor((pointX - offsetX) / tilePxLen);
    let coordY = Math.floor((pointY - offsetY) / tilePxLen);
    return { coordX, coordY };
}

// euclidian distance
function distance(x1, y1, x2, y2) {
    let a = (x1 - x2);
    let b = (y1 - y2);
    return Math.sqrt(a * a + b * b);
}

// denormalized euclidian distance
// appropriate for comparisions
function distance_raw(x1, y1, x2, y2) {
    let a = (x1 - x2);
    let b = (y1 - y2);
    return a * a + b * b;
}

module.exports = { calcCanvasXY, calcCoordinate, distance, distance_raw };
