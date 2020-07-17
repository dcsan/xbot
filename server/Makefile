# test app
testAppId=A017ADRUE49

dev-console:
	# DEBUG=bottender:action,mup* npm run dev -- --console
	DEBUG=mup* npm run dev -- --console

dev-slack:
	# DEBUG=bottender:action,mup* npm run dev -- --console
	DEBUG=mup* npm run dev

# verbose
proxy:
	ssh -v -R 80:localhost:33010 xbot@ssh.localhost.run
	# ssh -R 80:localhost:5000 serveo.net

# change slack endpoints
slack-config:
	open "https://api.slack.com/apps/${testAppId}/event-subscriptions"
	# open https://api.slack.com/apps/${testAppId}/interactive-messages
	# open https://api.slack.com/apps/${testAppId}/slash-commands?

	echo "use the proxy baseUrl + /api/webhooks/slack"


# single test
testRoomLook:
	npm run jest -- --watch -t 'look room'

testRoom:
	npm run jest -- --watch Room

testParser:
	npm run jest -- --watch RexParser

testGameObject:
	npm run jest -- --watch GameObject
