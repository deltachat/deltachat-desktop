import { createTokenClass, State, type Plugin } from 'linkifyjs'

// Create a new token class that the parser emits when it finds a bot command
const BotCommandToken = createTokenClass('botcommand', {
  isLink: true,
  toHref() {
    return this.toString()
  },
})

/**
 * Bot command parser plugin for linkify
 * Finds strings with a single slash at the beginning of a word
 * Allows alphanumeric characters and special characters: /,-,_,@
 * the related code in android is here:
 * https://github.com/deltachat/deltachat-android/blob/70a05221abc68f7352eb29d14b23734a2c9cc795/src/main/java/org/thoughtcrime/securesms/util/Linkifier.java#L12
 */
export const botcommand: Plugin = ({ scanner, parser }) => {
  const {
    SLASH,
    HYPHEN,
    AT,
    DOT,
    NUM,
    UNDERSCORE,
    ASCIINUMERICAL,
    ALPHANUMERICAL,
  } = scanner.tokens

  const { alpha, numeric, alphanumeric } = scanner.tokens.groups

  // Start with a slash
  const Slash = parser.start.tt(SLASH)

  // Create the accepting state for BotCommandToken
  // This state represents a valid bot command and will generate the final token
  const BotCommand = new State(BotCommandToken as any)

  // Define transitions from the slash state to the bot command state
  // These transitions determine what characters can immediately follow
  // a slash to form a valid bot command

  // Only allow alphabetic characters immediately after the slash.
  Slash.ta(alpha, BotCommand)

  // Allow alphanumeric tokens (which contain at least one letter)
  Slash.tt(ASCIINUMERICAL, BotCommand)
  Slash.tt(ALPHANUMERICAL, BotCommand)

  // Allow alphanumeric character groups to continue the command
  BotCommand.ta(alphanumeric, BotCommand)
  BotCommand.ta(numeric, BotCommand)

  // Allow specific alphanumeric tokens
  BotCommand.tt(NUM, BotCommand)
  BotCommand.tt(ASCIINUMERICAL, BotCommand)
  BotCommand.tt(ALPHANUMERICAL, BotCommand)

  // Allow only these special characters
  BotCommand.tt(HYPHEN, BotCommand)
  BotCommand.tt(UNDERSCORE, BotCommand)
  BotCommand.tt(DOT, BotCommand)
  // At sign for user/domain references like /user@domain
  BotCommand.tt(AT, BotCommand)
  // Slash for path-like commands like /path/to/command
  BotCommand.tt(SLASH, BotCommand)
}
