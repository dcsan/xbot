"use strict";
// This is the main file for the cbgbot bot.
Object.defineProperty(exports, "__esModule", { value: true });
// Import Botkit's core features
const botkit_1 = require("botkit");
const botkit_plugin_cms_1 = require("botkit-plugin-cms");
// Import a platform-specific adapter for slack.
const botbuilder_adapter_slack_1 = require("botbuilder-adapter-slack");
const botbuilder_storage_mongodb_1 = require("botbuilder-storage-mongodb");
// Load process.env values from .env file
const dotenv_1 = require("dotenv");
dotenv_1.config();
let storage = undefined;
if (process.env.MONGO_URI) {
    storage = new botbuilder_storage_mongodb_1.MongoDbStorage({
        url: process.env.MONGO_URI,
    });
    // @ts-ignore
    // mongoStorage = storage
}
const adapter = new botbuilder_adapter_slack_1.SlackAdapter({
    // REMOVE THIS OPTION AFTER YOU HAVE CONFIGURED YOUR APP!
    enable_incomplete: true,
    // parameters used to secure webhook endpoint
    verificationToken: process.env.VERIFICATION_TOKEN,
    clientSigningSecret: process.env.CLIENT_SIGNING_SECRET,
    // auth token for a single-team app
    botToken: process.env.BOT_TOKEN,
    // credentials used to set up oauth for multi-team apps
    clientId: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    scopes: ['bot'],
    redirectUri: process.env.REDIRECT_URI,
    // functions required for retrieving team-specific info
    // for use in multi-team apps
    // @ts-ignore
    getTokenForTeam: getTokenForTeam,
    // @ts-ignore
    getBotUserByTeam: getBotUserByTeam,
});
// Use SlackEventMiddleware to emit events that match their original Slack event types.
adapter.use(new botbuilder_adapter_slack_1.SlackEventMiddleware());
// Use SlackMessageType middleware to further classify messages as direct_message, direct_mention, or mention
adapter.use(new botbuilder_adapter_slack_1.SlackMessageTypeMiddleware());
const controller = new botkit_1.Botkit({
    webhook_uri: '/api/messages',
    adapter: adapter,
    storage,
});
if (process.env.CMS_URI) {
    controller.usePlugin(new botkit_plugin_cms_1.BotkitCMSHelper({
        uri: process.env.CMS_URI,
        // @ts-ignore
        token: process.env.CMS_TOKEN,
    }));
}
// Once the bot has booted up its internal services
controller.ready(() => {
    // load traditional developer-created local custom feature modules
    controller.loadModules(__dirname + '/features');
    /* catch-all that uses the CMS to trigger dialogs */
    if (controller.plugins.cms) {
        controller.on('message,direct_message', async (bot, message) => {
            let results = false;
            results = await controller.plugins.cms.testTrigger(bot, message);
            if (results !== false) {
                // do not continue middleware!
                return false;
            }
            return;
        });
    }
});
controller.webserver.get('/', (_req, res) => {
    res.send(`This app is running Botkit ${controller.version}.`);
});
controller.webserver.get('/install', (_req, res) => {
    // getInstallLink points to slack's oauth endpoint and includes clientId and scopes
    res.redirect(controller.adapter.getInstallLink());
});
controller.webserver.get('/install/auth', async (req, res) => {
    try {
        const results = await controller.adapter.validateOauthCode(req.query.code);
        console.log('FULL OAUTH DETAILS', results);
        // Store token by team in bot state.
        tokenCache[results.team_id] = results.bot.bot_access_token;
        // Capture team to bot id
        userCache[results.team_id] = results.bot.bot_user_id;
        res.json('Success! Bot installed.');
    }
    catch (err) {
        console.error('OAUTH ERROR:', err);
        res.status(401);
        res.send(err.message);
    }
});
let tokenCache = {};
let userCache = {};
if (process.env.TOKENS) {
    tokenCache = JSON.parse(process.env.TOKENS);
}
if (process.env.USERS) {
    userCache = JSON.parse(process.env.USERS);
}
async function getTokenForTeam(teamId) {
    if (tokenCache[teamId]) {
        return new Promise((resolve) => {
            setTimeout(function () {
                resolve(tokenCache[teamId]);
            }, 150);
        });
    }
    else {
        console.error('Team not found in tokenCache: ', teamId);
    }
}
async function getBotUserByTeam(teamId) {
    if (userCache[teamId]) {
        return new Promise((resolve) => {
            setTimeout(function () {
                resolve(userCache[teamId]);
            }, 150);
        });
    }
    else {
        console.error('Team not found in userCache: ', teamId);
    }
}
module.exports = adapter;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zcmMvaW5kZXgudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBLDRDQUE0Qzs7QUFFNUMsZ0NBQWdDO0FBQ2hDLG1DQUErQjtBQUMvQix5REFBbUQ7QUFFbkQsZ0RBQWdEO0FBQ2hELHVFQUF5RztBQUN6RywyRUFBMkQ7QUFFM0QseUNBQXlDO0FBQ3pDLG1DQUErQjtBQUMvQixlQUFNLEVBQUUsQ0FBQTtBQUVSLElBQUksT0FBTyxHQUFHLFNBQVMsQ0FBQTtBQUN2QixJQUFJLE9BQU8sQ0FBQyxHQUFHLENBQUMsU0FBUyxFQUFFO0lBQ3pCLE9BQU8sR0FBRyxJQUFJLDJDQUFjLENBQUM7UUFDM0IsR0FBRyxFQUFFLE9BQU8sQ0FBQyxHQUFHLENBQUMsU0FBUztLQUMzQixDQUFDLENBQUE7SUFDRixhQUFhO0lBQ2IseUJBQXlCO0NBQzFCO0FBRUQsTUFBTSxPQUFPLEdBQUcsSUFBSSx1Q0FBWSxDQUFDO0lBQy9CLHlEQUF5RDtJQUN6RCxpQkFBaUIsRUFBRSxJQUFJO0lBRXZCLDZDQUE2QztJQUM3QyxpQkFBaUIsRUFBRSxPQUFPLENBQUMsR0FBRyxDQUFDLGtCQUFrQjtJQUNqRCxtQkFBbUIsRUFBRSxPQUFPLENBQUMsR0FBRyxDQUFDLHFCQUFxQjtJQUV0RCxtQ0FBbUM7SUFDbkMsUUFBUSxFQUFFLE9BQU8sQ0FBQyxHQUFHLENBQUMsU0FBUztJQUUvQix1REFBdUQ7SUFDdkQsUUFBUSxFQUFFLE9BQU8sQ0FBQyxHQUFHLENBQUMsU0FBUztJQUMvQixZQUFZLEVBQUUsT0FBTyxDQUFDLEdBQUcsQ0FBQyxhQUFhO0lBQ3ZDLE1BQU0sRUFBRSxDQUFDLEtBQUssQ0FBQztJQUNmLFdBQVcsRUFBRSxPQUFPLENBQUMsR0FBRyxDQUFDLFlBQVk7SUFFckMsdURBQXVEO0lBQ3ZELDZCQUE2QjtJQUU3QixhQUFhO0lBQ2IsZUFBZSxFQUFFLGVBQWU7SUFDaEMsYUFBYTtJQUNiLGdCQUFn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