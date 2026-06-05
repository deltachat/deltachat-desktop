export type PaletteSection = 'accounts' | 'chats' | 'contacts' | 'messages'

export type PaletteScope = 'root' | 'account' | 'chat'

export type PaletteAvatar = {
  displayName: string
  avatarPath?: string | null
  color?: string
  addr?: string
}

export type PaletteItem = {
  id: string
  section: PaletteSection
  label: string
  /** Secondary line: message preview, contact address, last message, … */
  subtitle?: string
  subtitleAuthor?: string
  avatar?: PaletteAvatar
  chatScope?: { id: number; name: string }
  // inside a chat (message search results), the message text (subtitle)
  // is the most important part so we render it stronger than the label and the author
  labelDimmed?: boolean
  subtitleStrong?: boolean
  run: () => void | Promise<void>
}
