import { Logger } from '../../lib/LogLib'
import { GameObject } from './GameObject'

class Item extends GameObject {

  constructor(doc, story) {
    super(doc, story, 'item')
  }

}

export default Item
