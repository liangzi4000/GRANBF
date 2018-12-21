const puppeteer = require('puppeteer');
const sql = require('mssql');
const path = require('path');
const config = require('./config.json');
const db = require('./database');
const clientscript = require('./clientscript');
const gmail = require('./gmail');
const common = require('./common');
const gbfcore = require('./gbfcore');

(async () => {
    const browser = await puppeteer.launch({
        headless: false, args: [
            '--start-maximized',
            //'--kiosk',
            //'--start-fullscreen',
            '--no-default-browser-check',
            '--no-first-run',
            '--disable-infobars',
            //'--disable-session-crashed-bubble',
            //'--incognito'
            '--aggressive-cache-discard',
            '--disable-cache',
            '--disable-application-cache',
            '--disable-offline-load-stale-cache',
            '--disk-cache-size=0',
        ],
        //slowMo:220
    });
    const page = await browser.newPage();

    await page.setViewport({ width: config.environment.resolution.width, height: config.environment.resolution.height });
    console.log(`${path.basename(__filename)}: Open login page`);
    await page.goto(config.startupurl);

    console.log(`${path.basename(__filename)}: Tap on continue`);
    await common.tapOn(page, "#login-auth");

    console.log(`${path.basename(__filename)}: Click on mobage`);
    await common.clickOn(page, "#mobage-login");

    console.log(`${path.basename(__filename)}: Get account info from database`);
    let accountinfo = await db.CreateNextMBGAAccount();

    let regpagetarget = await browser.waitForTarget(target => target.url().indexOf('mobage') > -1);
    let regpage = await regpagetarget.page();
    await common.typeOn(regpage, "#register-subject-id", accountinfo.recordset[0].Email);
    await common.clickOn(regpage, "#register-subject-button", false);
    await regpage.waitForNavigation();
    let otp = await gmail.GetOTP();
    while (otp == 0) {
        await common.delay(2000);
        otp = await gmail.GetOTP();
    }
    await common.typeOn(regpage, "#pincode", otp);
    await common.clickOn(regpage, "button[type='submit'][name='send']", false);

    await regpage.waitForNavigation();
    await common.typeOn(regpage, "input[type='text'][name='nickname']", accountinfo.recordset[0].NickName);
    await common.typeOn(regpage, "input[type='password'][name='subject_password']", accountinfo.recordset[0].Pwd);
    await common.typeOn(regpage, "input[type='password'][name='subject_password_for_confirmation']", accountinfo.recordset[0].Pwd);
    await common.typeOn(regpage, "input[type='tel'][name='year']", accountinfo.recordset[0].Year.toString());
    await regpage.select("select[name='month']", accountinfo.recordset[0].Month.toString());
    await regpage.select("select[name='day']", accountinfo.recordset[0].Day.toString());
    await regpage.select("select[name='security_question_id']", accountinfo.recordset[0].Question.toString());
    await common.typeOn(regpage, "input[type='text'][name='answer']", accountinfo.recordset[0].Answer);
    await common.clickOn(regpage, "#send", false);
    await regpage.waitForNavigation();
    await common.clickOn(regpage, "#mobage-connect-authorize-consent-execute", false);
    await db.CompleteMBGAAccount(accountinfo.recordset[0].Email);
    console.log('end');
})();
