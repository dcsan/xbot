import Logger from '../../lib/Logger'
import GameObject from './GameObject'
import SlackAdapter from '../../lib/adapters/SlackAdapter'

class Item extends GameObject {

  constructor(doc, room) {
    super(doc, room)
  }

}

export default Item
