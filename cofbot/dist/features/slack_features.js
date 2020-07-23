"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
const botbuilder_adapter_slack_1 = require("botbuilder-adapter-slack");
module.exports = function (controller) {
    controller.ready(async () => {
        if (process.env.MYTEAM) {
            let bot = await controller.spawn(process.env.MYTEAM);
            await bot.startConversationInChannel(process.env.MYCHAN, process.env.MYUSER);
            bot.say('I AM AWOKEN.');
        }
    });
    controller.on('direct_message', async (bot, message) => {
        await bot.reply(message, 'I heard a private message');
    });
    controller.hears('dm me', 'message', async (bot, message) => {
        await bot.startPrivateConversation(message.user);
        await bot.say(`Let's talk in private.`);
    });
    controller.on('direct_mention', async (bot, message) => {
        await bot.reply(message, `I heard a direct mention that said "${message.text}"`);
    });
    controller.on('mention', async (bot, message) => {
        await bot.reply(message, `You mentioned me when you said "${message.text}"`);
    });
    controller.hears('ephemeral', 'message,direct_message', async (bot, message) => {
        await bot.replyEphemeral(message, 'This is an ephemeral reply sent using bot.replyEphemeral()!');
    });
    controller.hears('threaded', 'message,direct_message', async (bot, message) => {
        await bot.replyInThread(message, 'This is a reply in a thread!');
        await bot.startConversationInThread(message.channel, message.user, message.incoming_message.channelData.ts);
        await bot.say('And this should also be in that thread!');
    });
    controller.hears('blocks', 'message', async (bot, message) => {
        await bot.reply(message, {
            blocks: [
                {
                    type: 'section',
                    text: {
                        type: 'mrkdwn',
                        text: "Hello, Assistant to the Regional Manager Dwight! *Michael Scott* wants to know where you'd like to take the Paper Company investors to dinner tonight.\n\n *Please select a restaurant:*",
                    },
                },
                {
                    type: 'divider',
                },
                {
                    type: 'section',
                    text: {
                        type: 'mrkdwn',
                        text: '*Farmhouse Thai Cuisine*\n:star::star::star::star: 1528 reviews\n They do have some vegan options, like the roti and curry, plus they have a ton of salad stuff and noodles can be ordered without meat!! They have something for everyone here',
                    },
                    accessory: {
                        type: 'image',
                        image_url: 'https://s3-media3.fl.yelpcdn.com/bphoto/c7ed05m9lC2EmA3Aruue7A/o.jpg',
                        alt_text: 'alt text for image',
                    },
                },
                {
                    type: 'section',
                    text: {
                        type: 'mrkdwn',
                        text: '*Kin Khao*\n:star::star::star::star: 1638 reviews\n The sticky rice also goes wonderfully with the caramelized pork belly, which is absolutely melt-in-your-mouth and so soft.',
                    },
                    accessory: {
                        type: 'image',
                        image_url: 'https://s3-media2.fl.yelpcdn.com/bphoto/korel-1YjNtFtJlMTaC26A/o.jpg',
                        alt_text: 'alt text for image',
                    },
                },
                {
                    type: 'section',
                    text: {
                        type: 'mrkdwn',
                        text: '*Ler Ros*\n:star::star::star::star: 2082 reviews\n I would really recommend the  Yum Koh Moo Yang - Spicy lime dressing and roasted quick marinated pork shoulder, basil leaves, chili & rice powder.',
                    },
                    accessory: {
                        type: 'image',
                        image_url: 'https://s3-media2.fl.yelpcdn.com/bphoto/DawwNigKJ2ckPeDeDM7jAg/o.jpg',
                        alt_text: 'alt text for image',
                    },
                },
                {
                    type: 'divider',
                },
                {
                    type: 'actions',
                    elements: [
                        {
                            type: 'button',
                            text: {
                                type: 'plain_text',
                                text: 'Farmhouse',
                                emoji: true,
                            },
                            value: 'Farmhouse',
                        },
                        {
                            type: 'button',
                            text: {
                                type: 'plain_text',
                                text: 'Kin Khao',
                                emoji: true,
                            },
                            value: 'Kin Khao',
                        },
                        {
                            type: 'button',
                            text: {
                                type: 'plain_text',
                                text: 'Ler Ros',
                                emoji: true,
                            },
                            value: 'Ler Ros',
                        },
                    ],
                },
            ],
        });
    });
    controller.on('block_actions', async (bot, message) => {
        await bot.reply(message, `Sounds like your choice is ${message.incoming_message.channelData.actions[0].value}`);
    });
    controller.on('slash_command', async (bot, message) => {
        if (message.text === 'plain') {
            await bot.reply(message, 'This is a plain reply');
        }
        else if (message.text === 'public') {
            await bot.replyPublic(message, 'This is a public reply');
        }
        else if (message.text === 'private') {
            await bot.replyPrivate(message, 'This is a private reply');
        }
        // set http status
        bot.httpBody({ text: 'You can send an immediate response using bot.httpBody()' });
    });
    controller.on('interactive_message', async (bot, message) => {
        console.log('INTERACTIVE MESSAGE', message);
        switch (message.actions[0].name) {
            case 'replace':
                await bot.replyInteractive(message, '[ A previous message was successfully replaced with this less exciting one. ]');
                break;
            case 'dialog':
                await bot.replyWithDialog(message, new botbuilder_adapter_slack_1.SlackDialog('this is a dialog', '123', 'Submit', [
                    {
                        type: 'text',
                        label: 'Field 1',
                        name: 'field1',
                    },
                    {
                        type: 'text',
                        label: 'Field 2',
                        name: 'field2',
                    },
                ])
                    .notifyOnCancel(true)
                    .state('foo')
                    .asObject());
                break;
            default:
                await bot.reply(message, 'Got a button click!');
        }
    });
    controller.on('dialog_submission', async (bot, message) => {
        await bot.reply(message, 'Got a dialog submission');
        // Return an error to Slack
        bot.dialogError([
            {
                name: 'field1',
                error: 'there was an error in field1',
            },
        ]);
    });
    controller.on('dialog_cancellation', async (bot, message) => {
        await bot.reply(message, 'Got a dialog cancellation');
    });
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2xhY2tfZmVhdHVyZXMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvZmVhdHVyZXMvc2xhY2tfZmVhdHVyZXMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQTs7O0dBR0c7QUFDSCx1RUFBc0Q7QUFFdEQsTUFBTSxDQUFDLE9BQU8sR0FBRyxVQUFVLFVBQVU7SUFDbkMsVUFBVSxDQUFDLEtBQUssQ0FBQyxLQUFLLElBQUksRUFBRTtRQUMxQixJQUFJLE9BQU8sQ0FBQyxHQUFHLENBQUMsTUFBTSxFQUFFO1lBQ3RCLElBQUksR0FBRyxHQUFHLE1BQU0sVUFBVSxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxDQUFBO1lBQ3BELE1BQU0sR0FBRyxDQUFDLDBCQUEwQixDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsTUFBTSxFQUFFLE9BQU8sQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLENBQUE7WUFDNUUsR0FBRyxDQUFDLEdBQUcsQ0FBQyxjQUFjLENBQUMsQ0FBQTtTQUN4QjtJQUNILENBQUMsQ0FBQyxDQUFBO0lBRUYsVUFBVSxDQUFDLEVBQUUsQ0FBQyxnQkFBZ0IsRUFBRSxLQUFLLEVBQUUsR0FBRyxFQUFFLE9BQU8sRUFBRSxFQUFFO1FBQ3JELE1BQU0sR0FBRyxDQUFDLEtBQUssQ0FBQyxPQUFPLEVBQUUsMkJBQTJCLENBQUMsQ0FBQTtJQUN2RCxDQUFDLENBQUMsQ0FBQTtJQUVGLFVBQVUsQ0FBQyxLQUFLLENBQUMsT0FBTyxFQUFFLFNBQVMsRUFBRSxLQUFLLEVBQUUsR0FBRyxFQUFFLE9BQU8sRUFBRSxFQUFFO1FBQzFELE1BQU0sR0FBRyxDQUFDLHdCQUF3QixDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQTtRQUNoRCxNQUFNLEdBQUcsQ0FBQyxHQUFHLENBQUMsd0JBQXdCLENBQUMsQ0FBQTtJQUN6QyxDQUFDLENBQUMsQ0FBQTtJQUVGLFVBQVUsQ0FBQyxFQUFFLENB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