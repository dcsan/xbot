module.exports = {
  channels: {
    slack: {
      enabled: true,
      path: '/api/webhooks/slack',
      accessToken: process.env.SLACK_ACCESS_TOKEN,
      signingSecret: process.env.SLACK_SIGNING_SECRET,
      // verificationToken: process.env.SLACK_VERIFICATION_TOKEN, // deprecated, use signingSecret
    },
  },
};