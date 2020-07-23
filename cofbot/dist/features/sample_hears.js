"use strict";
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
module.exports = function (controller) {
    // use a function to match a condition in the message
    controller.hears(async (message) => message.text && message.text.toLowerCase() === 'foo', ['message'], async (bot, message) => {
        await bot.reply(message, 'I heard "foo" via a function test');
    });
    // use a regular expression to match the text of the message
    controller.hears(new RegExp(/^\d+$/), ['message', 'direct_message'], async function (bot, message) {
        await bot.reply(message, { text: 'I heard a number using a regular expression.' });
    });
    // match any one of set of mixed patterns like a string, a regular expression
    controller.hears(['allcaps', new RegExp(/^[A-Z\s]+$/)], ['message', 'direct_message'], async function (bot, message) {
        await bot.reply(message, { text: 'I HEARD ALL CAPS!' });
    });
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2FtcGxlX2hlYXJzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL2ZlYXR1cmVzL3NhbXBsZV9oZWFycy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUE7OztHQUdHO0FBQ0gsTUFBTSxDQUFDLE9BQU8sR0FBRyxVQUFVLFVBQVU7SUFDbkMscURBQXFEO0lBQ3JELFVBQVUsQ0FBQyxLQUFLLENBQ2QsS0FBSyxFQUFFLE9BQU8sRUFBRSxFQUFFLENBQUMsT0FBTyxDQUFDLElBQUksSUFBSSxPQUFPLENBQUMsSUFBSSxDQUFDLFdBQVcsRUFBRSxLQUFLLEtBQUssRUFDdkUsQ0FBQyxTQUFTLENBQUMsRUFDWCxLQUFLLEVBQUUsR0FBRyxFQUFFLE9BQU8sRUFBRSxFQUFFO1FBQ3JCLE1BQU0sR0FBRyxDQUFDLEtBQUssQ0FBQyxPQUFPLEVBQUUsbUNBQW1DLENBQUMsQ0FBQTtJQUMvRCxDQUFDLENBQ0YsQ0FBQTtJQUVELDREQUE0RDtJQUM1RCxVQUFVLENBQUMsS0FBSyxDQUFDLElBQUksTUFBTSxDQUFDLE9BQU8sQ0FBQyxFQUFFLENBQUMsU0FBUyxFQUFFLGdCQUFnQixDQUFDLEVBQUUsS0FBSyxXQUFXLEdBQUcsRUFBRSxPQUFPO1FBQy9GLE1BQU0sR0FBRyxDQUFDLEtBQUssQ0FBQyxPQUFPLEVBQUUsRUFBRSxJQUFJLEVBQUUsOENBQThDLEVBQUUsQ0FBQyxDQUFBO0lBQ3BGLENBQUMsQ0FBQyxDQUFBO0lBRUYsNkVBQTZFO0lBQzdFLFVBQVUsQ0FBQyxLQUFLLENBQUMsQ0FBQyxTQUFTLEVBQUUsSUFBSSxNQUFNLENBQUMsWUFBWSxDQUFDLENBQUMsRUFBRSxDQUFDLFNBQVMsRUFBRSxnQkFBZ0IsQ0FBQyxFQUFFLEtBQUssV0FBVyxHQUFHLEVBQUUsT0FBTztRQUNqSCxNQUFNLEdBQUcsQ0FBQyxLQUFLLENBQUMsT0FBTyxFQUFFLEVBQUUsSUFBSSxFQUFFLG1CQUFtQixFQUFFLENBQUMsQ0FBQTtJQUN6RCxDQUFDLENBQUMsQ0FBQTtBQUNKLENBQUMsQ0FBQSJ9