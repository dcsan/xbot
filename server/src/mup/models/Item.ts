import Logger from '../../lib/Logger'
import { GameObject } from './GameObject'
import SlackBuilder from '../pal/SlackBuilder'

class Item extends GameObject {

  constructor(doc, story) {
    super(doc, story, 'item')
  }

}

export default Item
