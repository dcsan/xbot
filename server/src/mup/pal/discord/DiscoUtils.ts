import AppConfig from '../../../lib/AppConfig'

const DiscoUtils = {

  installUrl() {
    const clientId = AppConfig.read('DISCORD_CLIENT_ID')
    const url = `https://discord.com/oauth2/authorize?client_id=${clientId}&scope=bot`
    return url
  }

}

export { DiscoUtils }
