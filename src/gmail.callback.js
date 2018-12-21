const fs = require('fs');
const util = require('util');
const readline = require('readline');
const { google } = require('googleapis');

const SCOPES = ['https://www.googleapis.com/auth/gmail.readonly', 'https://www.googleapis.com/auth/gmail.modify'];
const TOKEN_PATH = 'token.json';
fs.readFile('credentials.json', (err, data) => {
    if (err) console.log('Error loading client secret file:', err);
    //authorize(JSON.parse(data), listLabels);
    authorize(JSON.parse(data), listMessages);
});

/**
 * Create an OAuth2 client with the given credentials, and then execute the
 * given callback function.
 * @param {Object} credentials The authorization client credentials.
 * @param {function} callback The callback to call with the authorized client.
 */
function authorize(credentials, callback) {
    const { client_secret, client_id, redirect_uris } = credentials.installed;
    const oAuth2Client = new google.auth.OAuth2(
        client_id, client_secret, redirect_uris[0]);

    // Check if we have previously stored a token.
    fs.readFile(TOKEN_PATH, (err, token) => {
        if (err) return getNewToken(oAuth2Client, callback);
        oAuth2Client.setCredentials(JSON.parse(token));
        callback(oAuth2Client);
    });
}

/**
 * Get and store new token after prompting for user authorization, and then 
 * execute the given callback with the authorized OAuth2 client.
 * @param {google.auth.OAuth2} oAuth2Client The OAuth2 client to get token for.
 * @param {getEventsCallback} callback The callback for the authorized client.
 */
function getNewToken(oAuth2Client, callback) {
    const authUrl = oAuth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: SCOPES,
    });
    console.log('Authorize this app by visiting this url:', authUrl);
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
    });
    rl.question('Enter the code from that page here: ', (code) => {
        rl.close();
        oAuth2Client.getToken(code, (err, token) => {
            if (err) return console.error('Error retrieving access token', err);
            oAuth2Client.setCredentials(token);
            // Store the token to disk for later program executions
            fs.writeFile(TOKEN_PATH, JSON.stringify(token), (err) => {
                if (err) return console.error(err);
                console.log('Token stored to', TOKEN_PATH);
            });
            callback(oAuth2Client);
        });
    });
}

/**
 * Lists the labels in the user's account.
 * @param {google.auth.OAuth2} auth An authorized OAuth2 client.
 */
function listLabels(auth) {
    const gmail = google.gmail({ version: 'v1', auth });
    gmail.users.labels.list({
        userId: 'me',
    }, (err, res) => {
        if (err) return console.log('The API returned an error: ' + err);
        const labels = res.data.labels;
        if (labels.length) {
            console.log('Labels:');
            labels.forEach((label) => {
                console.log(`- ${label.name}`);
            });
        } else {
            console.log('No labels found.');
        }
    });
}

/**
 * Lists the messages in the user's account.
 * @param {google.auth.OAuth2} auth An authorized OAuth2 client.
 */
function listMessages(auth) {
    const gmail = google.gmail({ version: 'v1', auth });
    gmail.users.messages.list({
        userId: 'me',
        q: 'from:info@mbga.jp is:unread subject:[モバゲー]メールアドレス認証'
    }, (err, res) => {
        if (err) return console.log('The API returned an error: ' + err);
        const messages = res.data.messages;

        if (messages.length) {
            messages.forEach((item) => {
                gmail.users.messages.get({
                    userId: 'me',
                    id: item.id
                }, (err2, res2) => {
                    let matchcode = res2.data.snippet.match(/\d{4}/g);
                    console.log(matchcode[0]);
                    //console.log(res2.data.internalDate);
                });
                gmail.users.messages.modify({
                    userId: 'me',
                    id: item.id,
                    resource: {
                        removeLabelIds: ['UNREAD']
                    }
                }, (err2, res2) => {
                    console.log(err2);
                })
            });
        } else {
            console.log('No message found.');
        }
    });
}