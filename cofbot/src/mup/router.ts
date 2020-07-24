import {
  Botkit,
  BotWorker
} from "botkit";


export default function (controller: Botkit) {
  controller.on('message,direct_message', async (bot, message) => {
    await RouteHandler.handleText(bot, message)
  })
}

const RouteHandler = {
  async handleText(bot: BotWorker, message) {
    const reply = `echo: ${ message.text }`
    await bot.reply(message, reply)
  }
}