dev-console:
	# DEBUG=bottender:action,mup* npm run dev -- --console
	DEBUG=mup* npm run dev -- --console

dev-slack:
	# DEBUG=bottender:action,mup* npm run dev -- --console
	DEBUG=mup* npm run dev

proxy:
	ssh -R 80:localhost:5000 ssh.localhost.run
	# ssh -R 80:localhost:5000 serveo.net

# change slack endpoints
slack-config:
	open https://api.slack.com/apps/A016RSKNRBN/event-subscriptions
	open https://api.slack.com/apps/A016RSKNRBN/interactive-messages
	open https://api.slack.com/apps/A016RSKNRBN/slash-commands?

	echo "use /webhooks/slack"


