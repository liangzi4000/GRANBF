const puppeteer = require('puppeteer');
const sql = require('mssql');
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
        //slowMo:120
    });
    const page = await browser.newPage();

    await page.setViewport({ width: config.environment.resolution.width, height: config.environment.resolution.height });
    console.log('Open login page');
    await page.goto(config.startupurl);

    console.log('Select English Language');
    await common.selectOn(page, "select#language-type", "2");
    await page.waitFor(1000);

    console.log('Click on Save Changes button');
    await common.tapOn(page, "div.btn-setting-language");
    await page.waitForNavigation();

    console.log('Click on New Game');
    await common.tapOn(page, "div#start");

    console.log('Wait for tutorial 3 page');
    await common.waitForUrl(page, 'tutorial/3');

    console.log('Wait for tutorial 3 page fully loaded');
    await page.waitForFunction(clientscript.detectTutorial3);

    console.log('Go to tutorial 4 page');
    await page.goto('http://game.granbluefantasy.jp/#tutorial/4');

    await gbfcore.skipPage(page, 4);
    await gbfcore.skipBattle(page, 5);
    await gbfcore.skipPage(page, 6);
    await gbfcore.skipBattle(page, 7);
    await gbfcore.skipPage(page, 8);
    await gbfcore.skipBattle(page, 9);
    await gbfcore.skipPage(page, 12);

    await common.waitForUrl(page, 'tutorial/14');

    console.log('Tap on chapter 1 icon');
    await common.tapOn(page, 'div.prt-free-mask.btn-tutorial');

    console.log('Tap tips until chapter 1 quest');
    await common.tapUntil(page, 'div.txt-body', 'div.txt-quest-title');

    console.log('Tap on chapter 1 quest');
    await common.tapOn(page, 'div.txt-quest-title');

    console.log('Tap tips until choose a summon page');
    await common.tapUntil(page, 'div.txt-body', 'span.txt-supporter-name');

    console.log('Tap on first summon - Nameless Skyfarer Rank 1');
    await common.tapOn(page, 'span.txt-supporter-name');

    console.log('Tap on OK to start quest');
    await common.tapOn(page, 'div.btn-usual-ok.se-quest-start');

    await gbfcore.skipPage(page, 16);
    await gbfcore.skipPageScollingScene(page, 17);
    await gbfcore.skipPage(page, 18);
    await gbfcore.skipPageBattleTutorial(page, 19);

    await gbfcore.waitForPage(page, 20);
    console.log('Tap OK for EXP Gained');
    await common.tapOn(page, 'div.btn-usual-ok');
    await page.waitFor(1000);
    console.log('Tap OK for New Loot');
    await common.tapOn(page, 'div.btn-usual-ok');
    await page.waitFor(1000);
    console.log('Tap OK for New Loot');
    await common.tapOn(page, 'div.btn-usual-ok');
    console.log('Tap Home button');
    await common.tapOn(page, 'div.prt-button-area > a');

    await gbfcore.waitForPage(page, 23);
    console.log('Tap Draw menu');
    await common.tapOn(page, 'div.btn-link-gacha.se-ok');

    await gbfcore.waitForPage(page, 24);
    console.log(`Tap skip button on tutorial 24 page`);
    await common.tapOn(page, 'div.btn-skip');

    await gbfcore.waitForPage(page, 25);
    console.log(`Tap Draw 10 Using Rupies button on tutorial 25 page`);
    await common.tapOn(page, 'div.btn-lupi.multi');

    await gbfcore.waitForPage(page, 26);
    await page.goto(`${config.startupurl}/#tutorial/27`);
    console.log(`Jump to page 27 directly`);
/*     await page.waitForSelector('#cjs-gacha', { visible: true });
    console.log(`Tap crystal to draw`);
    await page.tap('#cjs-gacha')
    console.log(`Tap draw result`);
    await page.tap('#cjs-gacha')
    console.log(`test done`);
    await common.tapUntil(page, '#cjs-gacha', 'div.prt-buttons-area > a');
    console.log(`Tap Close button to exit`);
    await common.tapOn(page, 'div.prt-buttons-area > a');
    console.log(`Tap Equip Now button`);
    await common.tapOn(page, 'div.prt-tutorial-guid > a'); */

    await gbfcore.waitForPage(page, 27);
    console.log(`Tap skip button on tutorial 27 page`);
    await common.tapOn(page, 'div.btn-skip');

    await gbfcore.waitForPage(page, 28);
    console.log(`Tap Party button on tutorial 28 page`);
    await common.tapOn(page, 'div.btn-usual-ok');

    await gbfcore.waitForPage(page, 29);
    console.log(`Tap Auto Select button on tutorial 29 page`);
    await common.tapUntil(page, 'div.txt-body', 'div.btn-index-all-setting');
    await page.waitFor(1000);
    console.log(`Tap Select button on tutorial 29 page`);
    await common.tapOn(page, 'div.btn-party-order');
    await page.waitFor(1000);
    console.log(`Tap OK button on tutorial 29 page`);
    await common.tapOn(page, 'div.btn-usual-ok');

    await page.waitFor(1000);
    await common.tapOn(page, 'div.txt-body');

    await common.tapOn(page, 'div.btn-switch-weapon.btn-tab');
    await common.tapUntil(page, 'div.txt-body', 'div.btn-switch-summon.btn-tab');
    await common.tapOn(page, 'div.btn-switch-summon.btn-tab');
    await common.tapUntil(page, 'div.txt-body', 'div.prt-buttons-area > a');
    await common.tapOn(page, 'div.prt-buttons-area > a');

    await gbfcore.waitForPage(page, 30);
    console.log(`Tap skip button on tutorial 30 page`);
    await common.tapOn(page, 'div.btn-skip');

    await gbfcore.waitForPage(page, 31);
    console.log(`Tap skip button on tutorial 31 page`);
    await common.tapOn(page, 'div.btn-skip');

    console.log('Done');

    // console.log('Click on Skip');
    // await common.clickOn(page, "div.btn-skip");

    /* 
    await page.waitForSelector("#login-auth", { visible: true });
    //await page.tap("#login-auth"); why this line cannot work?
    await page.evaluate(clientscript.tapOn, "#login-auth");
    console.log('clicked on continue');

    await page.waitForSelector("#mobage-login", { visible: true });
    //await page.click("#mobage-login");
    await page.evaluate(clientscript.clickOn, "#mobage-login");
    console.log('clicked on mobage');

    let accountinfo = await db.CreateNextMBGAAccount();

    let regpagetarget = await browser.waitForTarget(target => target.url().indexOf('mobage') > -1);
    let regpage = await regpagetarget.page();
    await common.typeOn(regpage, "#register-subject-id", accountinfo.recordset[0].Email);
    await common.clickOn(regpage, "#register-subject-button");
    await regpage.waitForNavigation();
    let otp = await gmail.GetOTP();
    while (otp == 0) {
        await common.delay(2000);
        otp = await gmail.GetOTP();
    }
    await common.typeOn(regpage, "#pincode", otp);
    await common.clickOn(regpage,"button[type='submit'][name='send']");

    await regpage.waitForNavigation();
    await common.typeOn(regpage,"input[type='text'][name='nickname']",accountinfo.recordset[0].NickName);
    await common.typeOn(regpage,"input[type='password'][name='subject_password']",accountinfo.recordset[0].Pwd);
    await common.typeOn(regpage,"input[type='password'][name='subject_password_for_confirmation']",accountinfo.recordset[0].Pwd);
    await common.typeOn(regpage,"input[type='tel'][name='year']",accountinfo.recordset[0].Year.toString());
    await regpage.select("select[name='month']",accountinfo.recordset[0].Month.toString());
    await regpage.select("select[name='day']",accountinfo.recordset[0].Day.toString());
    await regpage.select("select[name='security_question_id']",accountinfo.recordset[0].Question.toString());
    await common.typeOn(regpage,"input[type='text'][name='answer']",accountinfo.recordset[0].Answer);
    await common.clickOn(regpage,"#send");
    await regpage.waitForNavigation();
    await common.clickOn(regpage,"#mobage-connect-authorize-consent-execute");
    
    console.log('end'); */
})();
