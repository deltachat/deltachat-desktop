import React from 'react'

import { ActionEmitter, KeybindAction } from '../../keybindings'
import { getLogger } from '../../../../shared/logger'
import { DialogContext } from '../../contexts/DialogContext'
import { I18nContext } from '../../contexts/I18nContext'

const log = getLogger('renderer/composer/ComposerMessageInput')

const browserSupportsCSSFieldSizing = CSS.supports('field-sizing', 'content')
const maxLines = 9

type ComposerMessageInputProps = {
  text: string
  /**
   * Whether the initial loading of the draft is being performed,
   * e.g. after switching the chat, or after a
   * {@linkcode BackendRemote.rpc.miscSetDraft} from outside of
   * {@linkcode useDraft}.
   */
  loadingDraft: boolean
  /**
   * Whether to render the HTML or to return `null`.
   */
  hidden?: boolean
  isMessageEditingMode: boolean
  chatId: number
  sendMessageOrEditRequest: () => void
  enterKeySends: boolean
  onPaste?: (e: React.ClipboardEvent<HTMLTextAreaElement>) => void
  // used to show/hide send button
  onChange: (text: string) => void
  /**
   * Called when ArrowUp is pressed and the input is empty.
   * Only relevant for non-editing mode.
   */
  onArrowUpWhenEmpty?: () => void
}

type ComposerMessageInputState = {
  // error?:boolean|Error
}

export default class ComposerMessageInput extends React.Component<
  ComposerMessageInputProps,
  ComposerMessageInputState
> {
  static contextType = DialogContext
  declare context: React.ContextType<typeof DialogContext>

  composerSize: number
  setCursorPosition: number | false
  textareaRef: React.RefObject<HTMLTextAreaElement | null>
  constructor(props: ComposerMessageInputProps) {
    super(props)

    this.composerSize = 48
    this.setComposerSize = this.setComposerSize.bind(this)
    this.setCursorPosition = false
    this.onKeyDown = this.onKeyDown.bind(this)
    this.onChange = this.onChange.bind(this)
    this.insertStringAtCursorPosition =
      this.insertStringAtCursorPosition.bind(this)

    this.textareaRef = React.createRef()
    this.focus = this.focus.bind(this)
  }

  componentDidMount() {
    ActionEmitter.registerHandler(KeybindAction.Composer_Focus, this.focus)
  }

  componentWillUnmount() {
    ActionEmitter.unRegisterHandler(KeybindAction.Composer_Focus, this.focus)
  }

  setComposerSize(size: number) {
    this.composerSize = size
  }

  focus() {
    log.debug('Focus composer message input')
    if (!this.context.hasOpenDialogs) {
      setTimeout(() => this.textareaRef?.current?.focus())
    }
  }

  componentDidUpdate(prevProps: ComposerMessageInputProps) {
    if (this.setCursorPosition && this.textareaRef.current) {
      this.textareaRef.current.selectionStart = this.setCursorPosition
      this.textareaRef.current.selectionEnd = this.setCursorPosition

      // don't force focus on the message input as long as the emoji picker is open
      if (
        !(
          document.querySelector(':focus')?.tagName?.toLowerCase() ===
          'em-emoji-picker'
        )
      ) {
        // Focus on the current selection, hack for focusing on newlines
        // TODO this pretty much doesn't work,
        // because you can't focus an element that is covered by a dialog.
        // See the comment in `onMouseUp` in `MessageListAndComposer`.
        if (this.context.hasOpenDialogs) {
          this.textareaRef.current.blur()
          this.textareaRef.current.focus()
        }
      }

      this.setCursorPosition = false
    } else {
      // This is useful when entering / exiting the message editing mode.
      if (
        prevProps.hidden !== this.props.hidden &&
        !this.props.hidden &&
        this.props.text.length !== 0
      ) {
        this.moveCursorToTheEnd()
      }
    }
    if (
      !browserSupportsCSSFieldSizing &&
      prevProps.chatId === this.props.chatId
    ) {
      this.resizeTextareaAndComposer()
    }
  }

  private moveCursorToTheEnd() {
    if (this.textareaRef.current == null) {
      log.warn(
        'Tried to move the cursor position to the end, ' +
          'but textareaRef.current is',
        this.textareaRef.current
      )
      return
    }
    this.textareaRef.current.selectionStart = this.props.text.length
    this.textareaRef.current.selectionEnd = this.props.text.length
  }

  onChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    const text = e.target.value
    this.props.onChange(text)
  }

  keyEventToAction(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    const enterKeySends = this.props.enterKeySends

    // ENTER + CTRL
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      return 'SEND'
      // ENTER
    } else if (e.key === 'Enter' && !e.shiftKey) {
      return enterKeySends ? 'SEND' : undefined
    }
  }

  onKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    const action = this.keyEventToAction(e)

    if (action === 'SEND') {
      this.props.sendMessageOrEditRequest()
      e.preventDefault()
      e.stopPropagation()
    } else if (
      e.key === 'ArrowUp' &&
      !e.ctrlKey &&
      !e.metaKey &&
      !e.altKey &&
      !e.shiftKey &&
      this.props.text.trim() === '' &&
      this.props.onArrowUpWhenEmpty
    ) {
      this.props.onArrowUpWhenEmpty()
      e.preventDefault()
      e.stopPropagation()
    }
  }

  resizeTextareaAndComposer() {
    const maxScrollHeight = maxLines * 24

    const el = this.textareaRef.current

    if (!el) {
      return
    }

    // We need to set the textarea height first to `auto` to get the real needed
    // scrollHeight. Ugly hack.
    el.style.height = 'auto'
    const scrollHeight = el.scrollHeight

    if (scrollHeight + 16 === this.composerSize) {
      el.style.height = scrollHeight + 'px'
      return
    }

    if (scrollHeight > maxScrollHeight && el.classList.contains('scroll')) {
      el.style.height = maxScrollHeight + 'px'
      return
    }

    if (scrollHeight < maxScrollHeight) {
      this.setComposerSize(scrollHeight + 16)
      el.style.height = scrollHeight + 'px'
      el.classList.remove('scroll')
    } else {
      this.setComposerSize(maxScrollHeight + 16)
      el.style.height = maxScrollHeight + 'px'
      el.classList.add('scroll')
    }
  }

  insertStringAtCursorPosition(str: string) {
    const textareaElem = this.textareaRef.current
    if (!textareaElem) {
      throw new Error('textareaElem missing')
    }
    const { selectionStart, selectionEnd } = textareaElem
    const textValue = this.props.text

    const textBeforeCursor = textValue.slice(0, selectionStart)
    const textAfterCursor = textValue.slice(selectionEnd)

    const updatedText = textBeforeCursor + str + textAfterCursor

    this.setCursorPosition = textareaElem.selectionStart + str.length

    this.props.onChange(updatedText)
  }

  render() {
    if (this.props.hidden) {
      return null
    }
    return (
      <I18nContext.Consumer>
        {({ writingDirection }) => (
          <textarea
            className={
              'message-input-area' +
              (browserSupportsCSSFieldSizing
                ? ' use-field-sizing-css-prop'
                : '')
            }
            style={{ '--maxLines': maxLines } as React.CSSProperties}
            id='composer-textarea'
            ref={this.textareaRef}
            rows={1}
            // intent={this.state.error ? 'danger' : 'none'}
            // large
            value={this.props.text}
            onKeyDown={this.onKeyDown}
            onChange={this.onChange}
            onPaste={this.props.onPaste}
            placeholder={
              this.props.isMessageEditingMode
                ? window.static_translate('edit_message')
                : window.static_translate('write_message_desktop')
            }
            disabled={this.props.loadingDraft}
            dir={
              writingDirection === 'rtl'
                ? 'rtl'
                : 'auto' /* auto is based on content but defaults to ltr */
            }
            spellCheck={true}
            aria-keyshortcuts='Control+M'
          />
        )}
      </I18nContext.Consumer>
    )
  }
}
