function StringToLines(string, maxWidth, context) {
    let lines = [];
    let words = string.split(' ');
    let wordIdx = 1;
    let currLine = words[0];
    while (words.length > wordIdx) {
        let currWord = words[wordIdx];
        let tmpCurrLine = currLine + ' ' + currWord;
        const width = context.measureText(tmpCurrLine).width;

        if (width > maxWidth) {
            lines.push(currLine);
            currLine = currWord;
        } else {
            currLine = tmpCurrLine;
        }
        wordIdx++;
    }
    lines.push(currLine);
    return lines;
};

module.exports = { StringToLines };