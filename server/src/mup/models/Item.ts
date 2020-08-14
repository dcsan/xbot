import { Logger } from '../../lib/LogLib'
import { GameObject } from './GameObject'
import SlackBuilder from '../pal/SlackBuilder'

class Item extends GameObject {

  constructor(doc, story) {
    super(doc, story, 'item')
  }

}

export default Item
