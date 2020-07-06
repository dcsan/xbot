const debug = require('debug')('mup:menu')
const Logger = require('../lib/Logger')

class Menu {

  async show (context) {
    // send a message with buttons and menu
    await context.chat.postMessage({
      attachments: [
        {
          text: 'Choose a game to play',
          fallback: 'You are unable to choose a game',
          callback_id: 'wopr_game',
          color: '#3AA3E3',
          attachment_type: 'default',
          actions: [
            {
              name: 'game',
              text: 'Chess',
              type: 'button',
              value: 'chess',
            },
            {
              name: 'game',
              text: "Falken's Maze",
              type: 'button',
              value: 'maze',
            },
            {
              name: 'game',
              text: 'Thermonuclear War',
              style: 'danger',
              type: 'button',
              value: 'war',
              confirm: {
                title: 'Are you sure?',
                text: "Wouldn't you prefer a good game of chess?",
                ok_text: 'Yes',
                dismiss_text: 'No',
              },
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


  async testImage (context) {
    const imageUrl = "https://images.techhive.com/images/article/2015/04/ransomnote-100581578-large.jpg"
    const attachments = [
      {
        "title": "ransom note",
        "image_url": imageUrl
      },
      {
        // text: 'Choose a game to play',
        fallback: 'You are unable to choose a game',
        callbackId: 'wopr_game',
        color: '#3AA3E3',
        attachmentType: 'default',
        actions: [
          {
            name: 'game',
            text: 'Read note',
            type: 'button',
            value: 'read note',
          },
        ],
      },
      {
        blocks: [
          {
            type: "section",
            text: {
              type: "mrkdwn",
              text: "*Alternative* <https://google.com|google> options"
            }
          },
          {
            type: "image",
            image_url: imageUrl,
            alt_text: "a note in strange letters",
          },

          {
            "type": "section",
            "text": {
              "type": "mrkdwn",
              "text": "<https://example.com|Bates Motel> :star::star:"
            },
            "accessory": {
              "type": "button",
              "text": {
                "type": "plain_text",
                "text": "View",
                "emoji": true
              },
              "value": "view_alternate_1"
            }
          },

          {
            "type": "section",
            "block_id": "section567",
            "text": {
              "type": "mrkdwn",
              "text": "<https://google.com|Overlook Hotel> \n :star: \n Doors had too many axe holes, guest in room 237 was far too rowdy, whole place felt stuck in the 1920s."
            },
            "accessory": {
              "type": "image",
              "image_url": "https://is5-ssl.mzstatic.com/image/thumb/Purple3/v4/d3/72/5c/d3725c8f-c642-5d69-1904-aa36e4297885/source/256x256bb.jpg",
              "alt_text": "Haunted hotel image"
            }
          },

          {
            "type": "actions",
            "elements": [
              {
                "type": "button",
                "text": {
                  "type": "plain_text",
                  "text": "Reply to review",
                  "emoji": false
                }
              }
            ]
          },

          {
            "type": "actions",
            "elements": [
              {
                "type": "button",
                "text": {
                  "type": "plain_text",
                  "emoji": true,
                  "text": "Approve"
                },
                "style": "primary",
                "value": "click_me_123"
              },
              {
                "type": "button",
                "text": {
                  "type": "plain_text",
                  "emoji": true,
                  "text": "Deny"
                },
                "style": "danger",
                "value": "click_me_123"
              }
            ]
          },

          {
            "type": "context",
            "elements": [
              {
                "type": "image",
                "image_url": "https://pbs.twimg.com/profile_images/625633822235693056/lNGUneLX_400x400.jpg",
                "alt_text": "cute cat"
              },
              {
                "type": "mrkdwn",
                "text": "*Cat* has approved this message."
              }
            ]
          },

        ]
      },

    ]

    const blob = {
      text: "A ransom note",
      attachments: attachments
    }
    debug('blob', blob)
    context.postMessage(blob)
  }

  async test2 (context) {
    const blob1 = {
      "text": "There seem to be a sequence of numbers written down",
      "attachments": [
        {
          "text": "ransom note",
        },

        {
          "blocks": [
            {
              "type": "section",
              "block_id": "section567",
              "text": {
                "type": "mrkdwn",
                "text": "There seem to be a sequence of numbers written down"
              }
            },
            {
              "type": "image",
              "image_url": "https://images.techhive.com/images/article/2015/04/ransomnote-100581578-large.jpg",
              "title": "image title",
              "alt_text": "Haunted hotel image"
            }
          ]
        }
      ]
    }

    const blocks =
      [
        // {
        //   "type": "image",
        //   "image_url": "https://i1.wp.com/thetempest.co/wp-content/uploads/2017/08/The-wise-words-of-Michael-Scott-Imgur-2.jpg?w=1024&ssl=1",
        //   "alt_text": "inspiration"
        // },
        {
          "type": "image",
          "title": {
            "type": "plain_text",
            "text": "I Need a Marg",
            "emoji": true
          },
          "image_url": "https://assets3.thrillist.com/v1/image/1682388/size/tl-horizontal_main.jpg",
          "alt_text": "marg"
        }
      ]

    const blob = {
      "attachments": [
        {
          blocks
        }
      ]
    }

    Logger.logObj('test2', blob)
    context.postMessage(blob)
  }

}

module.exports = Menu
