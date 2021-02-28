import AppConfig from '../../../lib/AppConfig'

const DiscoUtils = {

  installUrl() {
    const clientId = AppConfig.read('DISCORD_CLIENT_ID')
    const permissions = AppConfig.read('PERMISSIONS') || '37215553'
    const url = `https://discord.com/oauth2/authorize?client_id=${clientId}&scope=bot&permissions=${permissions}`
    return url
  }

}

export { DiscoUtils }
