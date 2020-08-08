# TODO:

## Content

- look item - message even if in inv

- "aren't fully dressed yet" check - change message?
- add image on 'look' at end
- deafening cracks
- get poster: "You take Michael Jackson off the wall"
- multiple macaroni
- prevent multiple robes / getrobe
- room description goes missing?
- show desk state on open. maybe not on close?
- skip longer sentences > 5 words
- wardrobe handles / states
√ 'look room' global command
√ askaboutgame button broken
√ image url for drawing
√ remove boldface in poem
√ remove extra branch at start / continue - would skip 'macaroni'

- figure out tasks and lights / images out of sync?
currently:

      - name: task1
        imageUrl: asylum/rooms/cell.jpg
      - name: task2
        imageUrl: asylum/rooms/cell-1.jpg
      - name: task3
        imageUrl: asylum/rooms/cell-2.jpg
      - name: task4
        imageUrl: asylum/rooms/cell-3.jpg
      - name: task5
        imageUrl: asylum/rooms/cell-dark.jpg

- look robe when wearing. should say 'you're wearing the robe'
I removed the image call for the robe when you "look robe" because you may actually ave it in INV (as I did) at the time looking


## TOP:
itemCnames of undefined
13|cbg     |       at /mnt/ext250/web-apps/cbg.rik.ai/dist/mup/models/GameObject.js:8:71

- handled/not just return boolean

- TS jest https://github.com/kulshekhar/ts-jest
- add submodules for github actions / checkout
- case statement? to allow multiple IFs
- channel / GameManager -> based on slackEvent.payload.channel
- check if already have item / dont get it twice
- cleanup pal.input so it works for tests same as the app
- end to end test system / script
- exits with buttons?
- get XXX messages in parser / game level get passed to right object
- hint system
- hints show to the speaking user only?
- ignore too long sentences
- items shouldn't appear in room if you 'get' them
- merge branch and stateInfo types
- rotating hint footer system
- test logic of 'drop' item
? buttons for doors?
? buttons to inspect items?
X store some session info (curent game?) in Pal ? so that imageUrl can use the current game
√ actions
√ better error handling with return an HandleCode
√ deploy!
√ display item cards etc.
√ finish goto?
√ footer element on blocks
√ footer message block
√ hidden item
√ hidden property on objects
√ implement basic 'drop' event
√ initProps
√ item IF / THEN / ELSE blocks
√ merge files for actions?
√ move assets to CDN as separate repo
√ note book / task list
√ on 'get' player carry items / inventory
√ prevent taking fixed items
√ session info from slackEvent => PAL
√ synonym parser @wardrobe
√ synonym replacements
√ use X on Y
√ use handle on sink


# Tester feedback / comments

this is a giveaway:

Jamin  6:33 PM
Use faucet

cbg2APP  6:33 PM
the handle is broken

Jamin  6:33 PM
X handle

cbg2APP  6:33 PM
That's an odd looking handle attached to the closet
