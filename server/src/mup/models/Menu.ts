import { Logger } from '../../lib/Logger'

class Menu {

  // handleButton(context, game) {
  // const buttonEvents = {
  //   helpMenu: {
  //     value: 'look',
  //   }
  // }
  // switch (context.event.callbackId) {
  //   case 'helpmenu'
  // }
  // await context.sendText(
  //   `I received your '${context.event.callbackId}' action`
  // )
  // }

  async help(context) {
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
              value: 'morehelp',
            },

          ],
        },
      ],
    });
  }

  async inventory(context, _game) {
    await context.chat.postMessage({
      attachments: [
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
      ]
    })
  }
}


export default Menu

