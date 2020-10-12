## Installing and setting up the Escape Bot (XBOT)

You need to have some type of 'verify' setup for your server, as the bot doesn't currently use a prefix.

## Roles

Make a role for the bot for example. It needs:
  read write and emoji reactions

Install the bot from here:
https://discord.com/oauth2/authorize?client_id=759874591694389279&scope=bot

add that role to the bot

## Bot Admin Commands
Make another role called `AsylumStaff`
It's better to have this as a separate new role in case you give out to someone else.
Give yourself that role. Now you (and only you) can use admin commands on the bot:

- clear - clears history in the channel
- reset - resets current channel
- gt (room) - jump right to a specific room (eg cell or lobby)
- st - status - for debugging

Also we have a help message telling people to ping `@AsylumStaff` for help

## Bonus Welcome Message
If you create a channel called
🚀-lobby
then the bot will welcome new users joining your server.
Later I'm going to add buttons there to create private "team" channels.

Enjoy!
