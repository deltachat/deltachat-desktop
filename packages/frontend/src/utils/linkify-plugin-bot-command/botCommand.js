import { createTokenClass, State } from 'linkifyjs'

// Create a new token class that the parser emits when it finds a bot command
const BotCommandToken = createTokenClass('botcommand', {
  isLink: true,
  toHref() {
    return this.toString()
  },
})

/**
 * Bot command parser plugin for linkify
 * Finds strings with a single trailing slash at the beginning of a word
 * Allows alphanumeric characters and special characters: ?!:-_
 * @type {import('linkifyjs').Plugin}
 */
export default function botcommand({ scanner, parser }) {
  const {
    SLASH,
    QUERY,
    EXCLAMATION,
    HYPHEN,
    COLON,
    UNDERSCORE,
    EQUALS,
    ASCIINUMERICAL,
    ALPHANUMERICAL,
  } = scanner.tokens
  const { alphanumeric } = scanner.tokens.groups

  // Start with a slash
  const Slash = parser.start.tt(SLASH)

  // Bot command state - accepting state that emits the token
  const BotCommand = new State(BotCommandToken)

  // Transition from slash to valid command characters
  Slash.tt(ASCIINUMERICAL, BotCommand)
  Slash.tt(ALPHANUMERICAL, BotCommand)
  Slash.ta(alphanumeric, BotCommand)

  // Allow the special characters in the command
  Slash.tt(QUERY, BotCommand)
  Slash.tt(EXCLAMATION, BotCommand)
  Slash.tt(HYPHEN, BotCommand)
  Slash.tt(COLON, BotCommand)
  Slash.tt(UNDERSCORE, BotCommand)
  Slash.tt(EQUALS, BotCommand)

  // Continue building the command with more valid characters
  BotCommand.ta(alphanumeric, BotCommand)
  BotCommand.tt(ASCIINUMERICAL, BotCommand)
  BotCommand.tt(ALPHANUMERICAL, BotCommand)
  BotCommand.tt(QUERY, BotCommand)
  BotCommand.tt(EXCLAMATION, BotCommand)
  BotCommand.tt(HYPHEN, BotCommand)
  BotCommand.tt(COLON, BotCommand)
  BotCommand.tt(UNDERSCORE, BotCommand)
  BotCommand.tt(EQUALS, BotCommand)
}
