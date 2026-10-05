import { defineType } from 'sanity'

export const codeBlock = defineType({
  name: 'code',
  title: 'Code Block',
  type: 'object',
  fields: [
    {
      name: 'language',
      title: 'Language',
      type: 'string',
      options: {
        list: [
          { title: 'JavaScript', value: 'javascript' },
          { title: 'TypeScript', value: 'typescript' },
          { title: 'Python', value: 'python' },
          { title: 'HTML', value: 'html' },
          { title: 'CSS', value: 'css' },
          { title: 'JSON', value: 'json' },
          { title: 'Bash', value: 'bash' },
          { title: 'Plain Text', value: 'plaintext' },
        ],
      },
    },
    {
      name: 'code',
      title: 'Code',
      type: 'text',
      validation: (Rule: any) => Rule.required(),
    },
    {
      name: 'filename',
      title: 'Filename',
      type: 'string',
    },
  ],
})
