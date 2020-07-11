slackAppId = A016RSKNRBN

dev-console:
	# DEBUG=bottender:action,mup* npm run dev -- --console
	DEBUG=mup* npm run dev -- --console

dev-slack:
	# DEBUG=bottender:action,mup* npm run dev -- --console
	DEBUG=mup* npm run dev

# verbose
proxy:
	ssh -vvv -R 80:localhost:33010 xbot@ssh.localhost.run
	# ssh -R 80:localhost:5000 serveo.net

# change slack endpoints
slack-config:
	open https://api.slack.com/apps/${slashAppId}/event-subscriptions
	open https://api.slack.com/apps/${slashAppId}/interactive-messages
	open https://api.slack.com/apps/${slashAppId}/slash-commands?

	echo "use /webhooks/slack"


