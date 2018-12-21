const common = require('./common');

module.exports = {
    waitForPage: async function (page, tutorialpage) {
        console.log(`Wait for tutorial ${tutorialpage} page`);
        await common.waitForUrl(page, `tutorial/${tutorialpage}`);
    },

    skipPage: async function (page, tutorialpage) {
        await this.waitForPage(page, tutorialpage);
        console.log(`Tap skip button on tutorial ${tutorialpage} page`);
        await common.tapOn(page, 'div.btn-skip');
        console.log('Tap OK to confirm skip');
        await common.tapOn(page, 'div.btn-usual-ok');
    },

    skipBattle: async function (page, tutorialpage) {
        await this.waitForPage(page, tutorialpage);
        console.log('Tap skip battle tutorial');
        await common.tapOn(page, 'div.btn-skip-battle');
    },

    skipPageScollingScene: async function (page, tutorialpage) {
        await this.waitForPage(page, tutorialpage);
        await page.waitFor(2000);
        console.log(`Tap skip button on tutorial ${tutorialpage} page`);
        await common.tapUntil(page, 'div.btn-command-skip', '#pop div.btn-usual-ok');
        console.log('Tap skip to confirm skip');
        await common.tapOn(page, '#pop div.btn-usual-ok');
        await page.waitFor(1000);
        console.log('Tap OK for items picked up');
        await common.tapOn(page, '#pop div.btn-usual-ok');
    },

    skipPageBattleTutorial: async function(page,tutorialpage){
        await this.waitForPage(page, tutorialpage);
        console.log(`Tap skip on battle tutorial popup window`);
        await common.tapOn(page, 'div.btn-skip-battle');
    }
}