import React from 'react'
import { throttle } from '@deltachat-desktop/shared/util.js'

import { ActionEmitter, KeybindAction } from '../../keybindings'
import { getLogger } from '../../../../shared/logger'
import { DialogContext } from '../../contexts/DialogContext'

const log = getLogger('renderer/composer/ComposerMessageInput')

type ComposerMessageInputProps = {
  /**
   * Whether to render the HTML or to return `null`.
   */
  hidden?: boolean
  isMessageEditingMode: boolean
  chatId: number
  sendMessageOrEditRequest: () => void
  enterKeySends: boolean
  onPaste?: (e: React.ClipboardEvent<HTMLTextAreaElement>) => void
  updateDraftText: (text: string, InputChatId: number) => void
  // used to show/hide send button
  onChange: (text: string) => void
}

type ComposerMessageInputState = {
  text: string
  chatId: number
  // error?:boolean|Error
  loadingDraft: boolean
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
  throttledSaveDraft: ReturnType<typeof throttle>
  constructor(props: ComposerMessageInputProps) {
    super(props)
    this.state = {
      text: '',
      chatId: props.chatId,
      loadingDraft: false,
    }

    this.composerSize = 48
    this.setComposerSize = this.setComposerSize.bind(this)
    this.setCursorPosition = false
    this.onKeyDown = this.onKeyDown.bind(this)
    this.onChange = this.onChange.bind(this)
    this.insertStringAtCursorPosition =
      this.insertStringAtCursorPosition.bind(this)

    // Remember that the draft might be updated from the outside
    // of this component (with the `setText` method,
    // e.g. when the draft gets cleared after sending a message).
    // This can happen _after_ an `onChange` event but _before_
    // the unrelying throttled function invokation.
    this.throttledSaveDraft = throttle((text, chatId) => {
      if (this.state.chatId === chatId) {
        this.props.updateDraftText(text.trim() === '' ? '' : text, chatId)
      }
    }, 400)

    this.textareaRef = React.createRef()
    this.focus = this.focus.bind(this)
  }

  componentDidMount() {
    ActionEmitter.registerHandler(KeybindAction.Composer_Focus, this.focus)
  }

  componentWillUnmount() {
    ActionEmitter.unRegisterHandler(KeybindAction.Composer_Focus, this.focus)
  }

  static getDerivedStateFromProps(
    props: ComposerMessageInputProps,
    currentState: ComposerMessageInputState
  ) {
    if (currentState.chatId !== props.chatId) {
      return { chatId: props.chatId, text: '', loadingDraft: true }
    }
    return null
  }

  /**
   * Sets the text area value, and ensures that `updateDraftText`
   * does not get invoked until the next change to the draft text.
   *
   * Useful for setting / clearing draft text afer loading it from core,
   * e.g. after sending the message or opening a chat with an existing draft.
   */
  setText(text: string | null) {
    this.setState({ text: text || '', loadingDraft: false })
    this.throttledSaveDraft.cancel()
    this.props.onChange(text || '')
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

  getText() {
    return this.state.text
  }

  hasText(): boolean {
    return !this.getText().match(/^\s*$/)
  }

  componentDidUpdate(
    prevProps: ComposerMessageInputProps,
    prevState: ComposerMessageInputState
  ) {
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
        this.state.text.length !== 0
      ) {
        this.moveCursorToTheEnd()
      }
    }
    if (prevState.chatId === this.state.chatId) {
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
    this.textareaRef.current.selectionStart = this.state.text.length
    this.textareaRef.current.selectionEnd = this.state.text.length
  }

  onChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    const text = e.target.value
    this.props.onChange(text)
    this.setState({ text /*error: false*/ })
    this.throttledSaveDraft(text, this.state.chatId)
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
    }
  }

  resizeTextareaAndComposer() {
    const maxScrollHeight = 9 * 24

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
    const textValue = this.state.text

    const textBeforeCursor = textValue.slice(0, selectionStart)
    const textAfterCursor = textValue.slice(selectionEnd)

    const updatedText = textBeforeCursor + str + textAfterCursor

    this.setCursorPosition = textareaElem.selectionStart + str.length

    this.setState({ text: updatedText })
    this.props.onChange(updatedText)
    this.throttledSaveDraft(updatedText, this.state.chatId)
  }

  render() {
    if (this.props.hidden) {
      return null
    }
    return (
      <textarea
        className='message-input-area'
        id='composer-textarea'
        ref={this.textareaRef}
        rows={1}
        // intent={this.state.error ? 'danger' : 'none'}
        // large
        value={this.state.text}
        onKeyDown={this.onKeyDown}
        onChange={this.onChange}
        onPaste={this.props.onPaste}
        placeholder={
          this.props.isMessageEditingMode
            ? window.static_translate('edit_message')
            : window.static_translate('write_message_desktop')
        }
        disabled={this.state.loadingDraft}
        dir='auto'
        spellCheck={true}
        aria-keyshortcuts='Control+M'
      />
    )
  }
}
