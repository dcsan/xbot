// import {
//   Botkit,
//   BotWorker,
//   BotkitMessage
// } from "botkit";


// export default function (controller: Botkit) {
//   controller.on('message,direct_message', async (bot, message) => {
//     await RouteHandler.handleText(bot, message)
//   })
// }

// const RouteHandler = {
//   async handleText(bot: BotWorker, message: BotkitMessage) {
//     switch (message.text) {
//       case 'echo':
//         const reply = `echo: ${ message.text }`
//         await bot.reply(message, reply)
//         break
//       default:
//         await bot.reply(message, 'not handled')
//     }
//   }
// }
