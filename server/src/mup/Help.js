const debug = require('debug')('mup:menu')
const Logger = require('../lib/Logger')

class Help {

  async show (context) {
    // send a message with buttons and menu
    await context.chat.postMessage({
      attachments: [
        {
          text: 'Commands',
          fallback: 'You are unable to choose a game',
          callback_id: 'helpmenu',
          color: '#3AA3E3',
          attachment_type: 'default',
          actions: [
            {
              name: 'look',
              text: 'Look',
              type: 'button',
              value: 'look',
            },
            {
              name: 'examine',
              text: "eXamine",
              type: 'button',
              value: 'examine',
            },
            {
              name: 'inventory',
              text: 'Inventory',
              type: 'button',
              value: 'inventory',
              // confirm: {
              //   title: 'Are you sure?',
              //   text: "Wouldn't you prefer a good game of chess?",
              //   ok_text: 'Yes',
              //   dismiss_text: 'No',
              // },
            },
            {
              name: 'more',
              text: 'More...',
              type: 'button',
              value: 'more',
            },

          ],
        },
        {
          text: 'Choose a game to play',
          fallback:
            "If you could read this message, you'd be choosing something fun to do right now.",
          color: '#3AA3E3',
          attachment_type: 'default',
          callback_id: 'game_selection',
          actions: [
            {
              name: 'games_list',
              text: 'Pick a game...',
              type: 'select',
              options: [
                {
                  text: 'Hearts',
                  value: 'hearts',
                },
                {
                  text: 'Bridge',
                  value: 'bridge',
                },
                {
                  text: 'Checkers',
                  value: 'checkers',
                },
                {
                  text: 'Chess',
                  value: 'chess',
                },
                {
                  text: 'Poker',
                  value: 'poker',
                },
                {
                  text: "Falken's Maze",
                  value: 'maze',
                },
                {
                  text: 'Global Thermonuclear War',
                  value: 'war',
                },
              ],
            },
          ],
        },
      ],
    });
  }

}

module.exports = Help
