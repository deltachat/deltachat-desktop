export type PaletteSection = 'accounts' | 'chats' | 'contacts' | 'messages'

export type PaletteScope = 'root' | 'account' | 'chat'

export type PaletteFilter = 'unread'

/** Enough info to scope the palette to (and label the crumb for) an account. */
export type AccountPartial = {
  id: number
  name: string
  avatarPath?: string | null
  color?: string
  addr?: string
}

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
  freshMessageCounter?: number
  isMuted?: boolean
  chatScope?: { id: number; name: string }
  // Set on account items (root scope): Tab drills into that account to
  // browse its chats/messages without switching to it yet.
  accountScope?: AccountPartial
  // inside a chat (message search results), the message text (subtitle)
  // is the most important part so we render it stronger than the label and the author
  labelDimmed?: boolean
  subtitleStrong?: boolean
  run: () => void | Promise<void>
}
