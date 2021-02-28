# TEN and BoPo game engine

start the engine with

    npm run dev

Story/scripts are in `cdn/storydata` which is another git repo (submodule) to separate code and content.


Commands:

- status - player status and all items in the room
- cheat - see room actions
- debug - turn event debugging on/off
- log - show whole chat history


## Adding stories

To start on a new story
copy the .env.example file
modify

  storyName=YOURSTORY

add a new storyfile in `cdn/storydata/YOURSTORY/story/story.yaml`

starting block of story defines which 'room' file will be used.

```yaml
story:
  title: Goal setting
  cname: goals # internal reference
  startRoomDefault: goals

  # fuzzy matching on channel names
  startRooms:
    - channels: coach|goals
      room: goals
```

type `rs` to restart the story at any point.


## Parser

- NLP parser
note that also we use NLP matchers for all entities
https://dialogflow.cloud.google.com/#/agent/asylum-dgkb/editEntity/fe0f62ab-166f-4978-b569-08e7232c7989

- synonyms
Synonyms for words are curerntly in a shared file
  server/cdn/storydata/shared/synData.yaml
TODO - make this per story


## Ported to Discord
install:
https://discord.com/oauth2/authorize?client_id=123456789012345678&scope=bot

- Using discord JS master branch

    npm i -S "https://github.com/discordjs/discord.js#master"

or update the package.json directly

  "discord.js": "git+https://github.com/discordjs/discord.js.git#master",



