# TEN / BoPO Discord Bot Game system

A platform for creating games for the [TEN / BoPO Discord Bot](https://ten.rik.ai)

## Example Commands:

- status - player status and all items in the room
- cheat - see room actions
- look - view the room
- inv - items
- debug - turn event debugging on/off
- log - show whole chat history

Full Command list:
https://github.com/exiteer/xbot/blob/master/server/src/mup/parser/CommandList.ts

## Parser

You can see each command has it's own little regex and a route to the function to handle it.
eg `look`

```ts
  {
    cname: 'lookRoom',  // unique name in lookup table
    rex: /^(look|lookroom|👀)$/i,  // synonyms
    event: RouterService.lookRoom,  // handler function to call
    type: 'postCommand' // this happens *after* other events
  },
```

## Game events
There is a hierachy of models that accept events

```
- Game
  - Story
    - Room
      - Player
      - Item(s)
```


so then in [RouterService](https://github.com/exiteer/xbot/blob/master/server/src/mup/routing/RouterService.ts#L36)

the `look` command results get returned back to the user based on the current game/story/room instance.

```ts
  lookRoom: async (evt: SceneEvent) => {
    return await evt.game?.story.room.lookRoom(evt)
  },
```

in the [Room](https://github.com/exiteer/xbot/blob/master/server/src/mup/models/Room.ts#L118-L121)

```ts
  async lookRoom(evt: SceneEvent) {
    logger.log('lookRoom', this.roomObj.doc.name)
    await this.roomObj.describeThing(evt) // the room
  }
```

`this.roomObj` is an instance of the room model, which is got from a little up the hierarchy.
In this case it's a bit redundant as we are already in a room instance, but this allows events to be called on the room or actors in the room, or the game, without worrying at which level.

```ts
  // this method gets room of an item or just itself if running on the room
  get roomObj(): Room {
    // @ts-ignore
    if (this.klass === 'room') return <Room>this
    // @ts-ignore
    return this.room
  }
```

So we now have a room instance and we call `describeThing` on it.

This is a more abstract method that is called by the `lookRoom` that can be called on a room or a thing *in* the room.

So we pass it the highest level item the `event` from the user's interaction.

It's implemented in `GameObject` which is a more abstract class that Room and Item extend eg `class Room extends GameObject {`

So in [GameObject#describeThing](https://github.com/exiteer/xbot/blob/master/server/src/mup/models/GameObject.ts#L184-L190)

```ts
  // may work for rooms and things
  async describeThing(evt: SceneEvent) {
    const stateInfo: StateBlock = this.getStateBlock()
    const palBlocks = this.renderBlocks(stateInfo, evt.pal)
    await evt.pal.sendBlocks(palBlocks)
    return palBlocks
  }
```

`pal` is the 'Platform Abstraction Layer' that handles formatting output for Discord/Slack/Telegram whatever output channel.
So we use the `pal` to render the response and then return it all the way up the hierarchy.
"blocks" are a term since we can return a list of chat blocks to send to the user.

So in this case we're returning the `state` of the room as a 'block'.

Again this is implemented in [GameObject](https://github.com/exiteer/xbot/blob/master/server/src/mup/models/GameObject.ts#L168) so that rooms, items, players can all describe their state back to the chat in terms of 'blocks'.

```ts
  getStateBlock() {
    const state = this.state
    let block: StateBlock = this.doc.states.find(one => one.name === state)
    // logger.logObj(`get state [${state}] block`, { state, block })

    if (!block) {
      logger.warn('cant find block for state', { name: this.name, state })
      block = this.doc.states[0]
      if (!block) {
        // should never happen since states are required
        logger.assertDefined(block, 'cannot find block for state', { state: this.state, states: this.doc.states })
      }
    }
    return block
  }
```


## Adding stories

edit scripts in the cdn/storyData directory
note that also we use NLP matchers for all entities
https://dialogflow.cloud.google.com/#/agent/asylum-dgkb/editEntity/fe0f62ab-166f-4978-b569-08e7232c7989


## Ported to Discord
install:
https://discord.com/oauth2/authorize?client_id=123456789012345678&scope=bot

