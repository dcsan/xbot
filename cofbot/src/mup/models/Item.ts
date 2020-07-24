import Logger from '../../lib/Logger'
import GameObject from './GameObject'
import SlackBuilder from '../../lib/adapters/SlackBuilder'

class Item extends GameObject {

  constructor(doc, room) {
    super(doc, room)
  }

}

export default Item
