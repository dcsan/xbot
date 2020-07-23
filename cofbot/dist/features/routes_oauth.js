"use strict";
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
/**
 * This module implements the oauth routes needed to install an app
 */
module.exports = function (_controller) {
    // controller.webserver.get('/install', (req, res) => {
    //     // getInstallLink points to slack's oauth endpoint and includes clientId and scopes
    //     res.redirect(controller.adapter.getInstallLink());
    // });
    // controller.webserver.get('/install/auth', async (req, res) => {
    //     try {
    //         const results = await controller.adapter.validateOauthCode(req.query.code);
    //         console.log('FULL OAUTH DETAILS', results);
    //         // Store token by team in bot state.
    //         tokenCache[results.team_id] = results.bot.bot_access_token;
    //         // Capture team to bot id
    //         userCache[results.team_id] =  results.bot.bot_user_id;
    //         res.json('Success! Bot installed.');
    //     } catch (err) {
    //         console.error('OAUTH ERROR:', err);
    //         res.status(401);
    //         res.send(err.message);
    //     }
    // });
};
/**
 * This is a placeholder implementation for getTokenForTeam and getBotUserByTeam
 * TODO: how to expose these to botkit tho?
 */
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicm91dGVzX29hdXRoLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL2ZlYXR1cmVzL3JvdXRlc19vYXV0aC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUE7OztHQUdHO0FBQ0g7O0dBRUc7QUFDSCxNQUFNLENBQUMsT0FBTyxHQUFHLFVBQVUsV0FBVztJQUNwQyx1REFBdUQ7SUFDdkQsMEZBQTBGO0lBQzFGLHlEQUF5RDtJQUN6RCxNQUFNO0lBRU4sa0VBQWtFO0lBQ2xFLFlBQVk7SUFDWixzRkFBc0Y7SUFFdEYsc0RBQXNEO0lBRXRELCtDQUErQztJQUMvQyxzRUFBc0U7SUFFdEUsb0NBQW9DO0lBQ3BDLGlFQUFpRTtJQUVqRSwrQ0FBK0M7SUFFL0Msc0JBQXNCO0lBQ3RCLDhDQUE4QztJQUM5QywyQkFBMkI7SUFDM0IsaUNBQWlDO0lBQ2pDLFFBQVE7SUFDUixNQUFNO0FBQ1IsQ0FBQyxDQUFDO0FBRUY7OztHQUdHO0FBQ0gsSUFBSSxVQUFVLEdBQUcsRUFBRSxDQUFBO0FBQ25CLElBQUksU0FBUyxHQUFHLEVBQUUsQ0FBQTtBQUVsQixJQUFJLE9BQU8sQ0FBQyxHQUFHLENBQUMsTUFBTSxFQUFFO0lBQ3RCLFVBQVUsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLENBQUE7Q0FDNUM7QUFFRCxJQUFJLE9BQU8sQ0FBQyxHQUFHLENBQUMsS0FBSyxFQUFFO0lBQ3JCLFNBQVMsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLENBQUE7Q0FDMUM7QUFFRCxLQUFLLFVBQVUsZUFBZSxDQUFDLE1BQU07SUFDbkMsSUFBSSxVQUFVLENBQUMsTUFBTSxDQUFDLEVBQUU7UUFDdEIsT0FBTyxJQUFJLE9BQU8sQ0FBQyxDQUFDLE9BQU8sRUFBRSxFQUFFO1lBQzdCLFVBQVUsQ0FBQztnQkFDVCxPQUFPLENBQUMsVUFBVSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUE7WUFDN0IsQ0FBQyxFQUFFLEdBQUcsQ0FBQyxDQUFBO1FBQ1QsQ0FBQyxDQUFDLENBQUE7S0FDSDtTQUFNO1FBQ0wsT0FBTyxDQUFDLEtBQUssQ0FBQyxnQ0FBZ0MsRUFBRSxNQUFNLENBQUMsQ0FBQTtLQUN4RDtBQUNILENBQUM7QUFFRCxLQUFLLFVBQVUsZ0JBQWdCLENBQUMsTUFBTTtJQUNwQyxJQUFJLFNBQVMsQ0FBQyxNQUFNLENBQUMsRUFBRTtRQUNyQixPQUFPLElBQUksT0FBTyxDQUFDLENBQUMsT0FBTyxFQUFFLEVBQUU7WUFDN0IsVUFBVSxDQUFDO2dCQUNULE9BQU8sQ0FBQyxTQUFTLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQTtZQUM1QixDQUFDLEVBQUUsR0FBRyxDQUFDLENBQUE7UUFDVCxDQUFDLENBQUMsQ0FBQTtLQUNIO1NBQU07UUFDTCxPQUFPLENBQUMsS0FBSyxDQUFDLCtCQUErQixFQUFFLE1BQU0sQ0FBQyxDQUFBO0tBQ3ZEO0FBQ0gsQ0FBQyJ9