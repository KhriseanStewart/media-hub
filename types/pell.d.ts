declare module 'pell' {
  interface PellInitOptions {
    element: HTMLElement
    onChange?: (html: string) => void
    defaultParagraphSeparator?: string
    styleWithCSS?: boolean
    actions?: string[]
    classes?: {
      actionbar?: string
      button?: string
      content?: string
      selected?: string
    }
  }

  interface PellInstance {
    content: HTMLElement
    exec: (command: string, value?: string) => void
  }

  interface PellModule {
    init: (options: PellInitOptions) => PellInstance
    exec: (command: string, value?: string) => void
  }

  const pell: PellModule
  export default pell
  export const init: (options: PellInitOptions) => PellInstance
  export const exec: (command: string, value?: string) => void
}
