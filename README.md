# TEN / BoPO Discord Bot Game system

This is an engine to run text adventure games inside Discord.
It includes a full parser for a custom game scripting language.

Released as Open Source, so please do what you want!
If you need help leave an issue here in the repo or ask me.

I wrote up a bit more about the project genesis here:

https://dc.rik.ai/projects/ten

<img width='350px' src='https://dc.rik.ai/assets/projectDetail/ten/tut-clip-x2.gif' />

## Initial setup
Clone with submodules for story content

`git clone --recurse-submodules git@github.com:dcsan/xbot.git`

or if you already cloned it, get the submodules

`git submodule update --init --recursive`


## Try the game!

You can play the game by joining this server https://discord.gg/Qgup6qU

[![screenshot](docs/join-discord.png) ](https://discord.gg/Qgup6qU)


or install and play on your own server:

https://discord.com/oauth2/authorize?client_id=759874591694389279&scope=bot

# Adding stories

edit scripts in the [cdn/storyData](./server/cdn/storydata/) directory

Example story scripts are in another repo here
https://github.com/dcsan/storydata

Short example:

```yaml
rooms:
  - name: office

    states:
      - name: default
        long: A boring looking tech company's office. Seems like you've been here before, but it just looks the same as any other one.
        short: A large empty room with a corner `desk`
        imageUrl: office/rooms/office-chest-closed.jpg

    actions:
      - match: smell
        if:
          all:
            - matches.has = yes
        # if true then do this
        then:
          # reply and set property on the 'lamp' object
          reply: You light the lamp with the matches
          setProps:
            - lamp.state = lit
        # otherwise if NOT matches.has say this:
        else:
          reply: you don't have any matches```
```

# Engine functions

## Example Commands:

The script language is documented here with example stories:
https://github.com/dcsan/storydata

| command                    | description                             |
| -------------------------- | --------------------------------------- |
| `status`                   | player status and all items in the room |
| `look`                     | view the room                           |
| `look` `<item>`            | inspect an item                         |
| `get`                      | take an item from the room              |
| `inv`                      | show inventory items you're carrying    |
| `use` `<item>`             | use an item                             |
| `use` `<item>` on `<item>` | use an item with another thing          |
| `debug`                    | turn event debugging on/off             |
| `log`                      | show whole chat history                 |
| `cheat`                    | see room actions                        |

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

# DevOps
<details>
<summary>### Deploying / Nginx / Proxy </summary>

[Makefile](Makefile) has various deploy scripts

These are specific to my domain, so you will need to change eg cbg.rik.ai to your domain

`server/build` is where the built files the client go before deploying

### start server

make sure you have a `.env.production` file with the correct settings then
start the server with

`NODE_ENV=production pm2 --name=cbg start dist/index.js`

### ssh cert
if you update/deploy the nginx script, you might need to run certbot on the server again
check the certificate is in the correct place

`certbot certonly -n -d cbg.rik.ai --nginx`

### Static files
some web game features are in /client but you just need to host those files.
check nginx config for the correct path, eg

`/mnt/ext250/web-apps/cbg.rik.ai/cdn/`

sometimes the discord CDN will cache failed requests so be patient when updating files

### Notes

- NgInx permissions
https://www.ionos.com/community/server-cloud-infrastructure/nginx/solve-an-nginx-403-forbidden-error

- try_files
https://docs.nginx.com/nginx/admin-guide/web-server/serving-static-content/#trying-several-options

### Proxy for local dev
http://xbot-d9fc7b57.localhost.run/api/webhooks/slack

live app
https://cbg.rik.ai/api/webhooks/slack

### API calls
Everything handled by the server is under `/api` namespace.

</details>


More info about the company [TEN / BoPO Discord Bot](https://ten.rik.ai)
