import AppConfig from '../../lib/AppConfig'
const express = require('express')
const app = express()

const WebApp = {

  init() {
    const port = AppConfig.read('PORT') || 3000

    app.get('/status', (_req, res) => {
      res.send('Hello World!')
    })
    app.listen(port, () => {
      console.log(`express running on http://localhost:${port}`)
    })
  }

}

export { WebApp }
