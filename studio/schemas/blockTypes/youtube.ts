import { defineType } from 'sanity'

export const youtubeBlock = defineType({
  name: 'youtube',
  title: 'YouTube Embed',
  type: 'object',
  fields: [
    {
      name: 'url',
      title: 'YouTube URL',
      type: 'url',
      validation: (Rule: any) => Rule.required(),
    },
  ],
})
