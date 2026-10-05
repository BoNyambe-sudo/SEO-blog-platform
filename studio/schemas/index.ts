import post from './post'
import author from './author'
import category from './category'
import { codeBlock } from './blockTypes/code'
import { youtubeBlock } from './blockTypes/youtube'
import { calloutBlock } from './blockTypes/callout'

export const schemaTypes = [
  post,
  author,
  category,
  codeBlock,
  youtubeBlock,
  calloutBlock,
]
