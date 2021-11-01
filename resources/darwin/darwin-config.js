const fs = require('fs');
const util = require('util');
const cp = require('child_process');
const exec = util.promisify(cp.exec);
const xml2js = require('xml2js');
const builder = new xml2js.Builder();
const parser = require('xml2js').Parser();

let username = require("os").userInfo().username

let runCommand = async (command, args = {}) => {
    const { stdout, stderr } = await exec(command, args);
    if (stdout) {
        return stdout;
    }
    if (stderr) {
        return stderr;
    }
    return null;
}

let getJetBrainsProducts = async () => {
    let returnable = [];
    let dirs = await runCommand("ls", { cwd: `/Users/${username}/Library/Application\ Support/JetBrains` });
    dirs = dirs.split('\n');
    for (let dir of dirs) {
        if (dir != '' && dir !='bl' && dir !='crl' && dir != 'consentOptions') {
            returnable.push({
                productName: dir,
                productPath: `/Users/${username}/Library/Application\ Support/JetBrains/${dir}`,
                configPath: `/Users/${username}/Library/Application\ Support/JetBrains/${dir}/options/advancedSettings.xml`,
                configExists: fs.existsSync(`/Users/${username}/Library/Application\ Support/JetBrains/${dir}/options/advancedSettings.xml`)
            });
        }
    }
    return returnable;
}

export let enableAXDocumentForJetBrains = async () => {
    let config;
    let products = await getJetBrainsProducts();

    for (let product of products) {
        if (product.configExists) {
            let isKeyFound = false;
            config = await parser.parseStringPromise(await fs.readFileSync(product.configPath));
            let entries = config.application.component[0].option[0].map[0].entry;

            config.application.component[0].option[0].map[0].entry = entries.map(entry => {
                let { key, value } = entry['$'];
                if (key === 'ide.show.fileType.icon.in.titleBar') {
                    isKeyFound = true;
                    if (value != 'true') {
                        return { $: { 'key': 'ide.show.fileType.icon.in.titleBar', 'value': 'true' } };
                    }
                }

                return entry;
            });

            if (!isKeyFound) {
                config.application.component[0].option[0].map[0].entry.push({ $: { 'key': 'ide.show.fileType.icon.in.titleBar', 'value': 'true' } })
            }

        } else {
            config = {
                application: {
                    component: {
                        $: {
                            'name': 'AdvancedSettings',
                        },
                        option: {
                            $: {
                                'name': 'settings',
                            },
                            map: {
                                entry: {
                                    $: {
                                        'key': 'ide.show.fileType.icon.in.titleBar',
                                        'value': 'true'
                                    },
                                }
                            }
                        }
                    }
                }
            }
        }

        let rebuiltXML = builder.buildObject(config);
        if (rebuiltXML.startsWith('<?xml'))
            rebuiltXML = rebuiltXML.substring(rebuiltXML.indexOf('\n')+1);
        fs.writeFileSync(product.configPath, rebuiltXML);
    }
}

export let enableAXDocumentForVsCode = async () => {
    await runCommand(`'/Applications/Visual Studio Code.app/Contents/Resources/app/bin/code' --install-extension YoshinoriN.current-file-path`)
}

