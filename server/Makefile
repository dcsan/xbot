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
	echo "--- connecting ---"
	# ssh -v -R 80:localhost:33010 xbot@ssh.localhost.run &2> logs/proxy.log &
	# ssh -v -R 80:localhost:33010 xbot@ssh.localhost.run | grep "Connect to" | xargs echo "$1/api/slack/webhooks"
	ssh -v -R 80:localhost:33010 xbot@ssh.localhost.run | grep "Connect to"
	# ssh -v -R 80:localhost:33010 xbot@ssh.localhost.run

	# grep "Connect to" logs/proxy.log | xargs "$1/api/slack/webhooks"
	# sleep 2
	# echo "--- done ---"
	# cat logs/proxy.log
	# grep "Connect to" logs/proxy.log
	# ssh -R 80:localhost:5000 serveo.net

# change slack endpoints
slack-config:
	open "https://api.slack.com/apps/${testAppId}/event-subscriptions"
	# open https://api.slack.com/apps/${testAppId}/interactive-messages
	# open https://api.slack.com/apps/${testAppId}/slash-commands?

	echo "use the proxy baseUrl + /api/webhooks/slack"


# single test
testRoomItemActions:
	npm run jest:watch -- --watch -t 'room item actions'

testRoom:
	npm run jest:watch -- --watch Room

testParser:
	npm run jest:watch -- --watch RexParser

testGameObject:
	npm run jest:watch -- GameObject

testWordUtils:
	npm run jest:watch -- --watch WordUtils

testDispatch:
	npm run jest:watch -- --watch Dispatch

testRouter:
	npm run jest:watch -- --watch RexRouter

commitStories:
	cd cdn/storydata
	git add .
	git commit -m "auto"
	git push
