import { Botkit } from "botkit";

module.exports = function (controller: Botkit) {
  controller.hears('sample', 'message,direct_message', async (bot, message) => {
    await bot.reply(message, 'I heard a sample message.')
  })

  controller.on('message,direct_message', async (bot, message) => {
    const reply = `echo: ${ message.text }`
    console.log('echo', reply)
    await bot.reply(message, reply)
  })
}
