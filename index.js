const path = require('path');

module.exports = () => {
    return new Promise((resolve, reject) => {
        let returnable;
        if (process.platform === 'darwin') {
            const osascript = require('node-osascript');
            const { enableAXDocumentForJetBrains, enableAXDocumentForVsCode } = require(path.join(__dirname, './resources/darwin/darwin-config'));
            enableAXDocumentForVsCode();
            enableAXDocumentForJetBrains();

            osascript.executeFile(
                path.join(__dirname, './resources/darwin/get-foreground-window-title.osa'), 
                (error, data, raw) => {
                    if (error) reject(error);
                    returnable = {
                        processName: data[0],
                        processTitle: data[1],
                        filePath: data[2] != 'missing value' ? data[2] : null,
                        fileName: data[2] != 'missing value' ? data[2].split('/').pop() : null
                    }
                    osascript.executeFile(
                        path.join(__dirname, './resources/darwin/get-mouse-location.osa'),
                        (error, data, raw) => {
                            if (error) reject(error);
                            returnable.mouseX = Math.ceil(data[0]),
                            returnable.mouseY = Math.ceil(data[1])
                            resolve(returnable);
                        }
                    )
                }
            );
        } else {
            reject('Platform not supported');
        }
    });
};