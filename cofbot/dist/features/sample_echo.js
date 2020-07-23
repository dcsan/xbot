"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
module.exports = function (controller) {
    controller.hears('sample', 'message,direct_message', async (bot, message) => {
        await bot.reply(message, 'I heard a sample message.');
    });
    controller.on('message,direct_message', async (bot, message) => {
        await bot.reply(message, `Echo: ${message.text}`);
    });
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2FtcGxlX2VjaG8uanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvZmVhdHVyZXMvc2FtcGxlX2VjaG8udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFFQSxNQUFNLENBQUMsT0FBTyxHQUFHLFVBQVUsVUFBa0I7SUFDM0MsVUFBVSxDQUFDLEtBQUssQ0FBQyxRQUFRLEVBQUUsd0JBQXdCLEVBQUUsS0FBSyxFQUFFLEdBQUcsRUFBRSxPQUFPLEVBQUUsRUFBRTtRQUMxRSxNQUFNLEdBQUcsQ0FBQyxLQUFLLENBQUMsT0FBTyxFQUFFLDJCQUEyQixDQUFDLENBQUE7SUFDdkQsQ0FBQyxDQUFDLENBQUE7SUFFRixVQUFVLENBQUMsRUFBRSxDQUFDLHdCQUF3QixFQUFFLEtBQUssRUFBRSxHQUFHLEVBQUUsT0FBTyxFQUFFLEVBQUU7UUFDN0QsTUFBTSxHQUFHLENBQUMsS0FBSyxDQUFDLE9BQU8sRUFBRSxTQUFVLE9BQU8sQ0FBQyxJQUFLLEVBQUUsQ0FBQyxDQUFBO0lBQ3JELENBQUMsQ0FBQyxDQUFBO0FBQ0osQ0FBQyxDQUFBIn0=