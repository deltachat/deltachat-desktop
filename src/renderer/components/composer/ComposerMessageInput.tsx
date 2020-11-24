import React from 'react'
import debounce from 'debounce'
import { ActionEmitter, KeybindAction } from '../../keybindings'

type ComposerMessageInputProps = {
  chatId: number
  sendMessage: () => void
  enterKeySends: boolean
  updateDraftText: (text: string, InputChatId: number) => void
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
  composerSize: number
  setCursorPosition: number | false
  textareaRef: React.RefObject<HTMLTextAreaElement>
  saveDraft: () => void
  constructor(props: ComposerMessageInputProps) {
    super(props)
    this.state = {
      text: '',
      chatId: props.chatId,
      loadingDraft: true,
    }

    this.composerSize = 48
    this.setComposerSize = this.setComposerSize.bind(this)
    this.setCursorPosition = false
    this.onKeyDown = this.onKeyDown.bind(this)
    this.onChange = this.onChange.bind(this)
    this.insertStringAtCursorPosition = this.insertStringAtCursorPosition.bind(
      this
    )

    this.saveDraft = debounce(() => {
      const { text, chatId } = this.state
      this.props.updateDraftText(text, chatId)
    }, 500)

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

  setText(text: string) {
    this.setState({ text })
    this.setState({ loadingDraft: false })
  }

  setComposerSize(size: number) {
    this.composerSize = size
  }

  focus() {
    this.textareaRef.current.focus()
  }

  getText() {
    return this.state.text
  }

  clearText() {
    this.setState({ text: '' })
  }

  componentDidUpdate(
    _prevProps: ComposerMessageInputProps,
    prevState: ComposerMessageInputState
  ) {
    if (this.setCursorPosition) {
      this.textareaRef.current.selectionStart = this.setCursorPosition
      this.textareaRef.current.selectionEnd = this.setCursorPosition

      // Focus on the current selection, hack for focusing on newlines
      this.textareaRef.current.blur()
      this.textareaRef.current.focus()

      this.setCursorPosition = false
    }
    if (prevState.chatId === this.state.chatId) {
      this.resizeTextareaAndComposer()
      if (prevState.text !== this.state.text) {
        if (!this.state.loadingDraft) {
          this.saveDraft()
        }
      }
    }
  }

  onChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    this.setState({ text: e.target.value /*error: false*/ })
    if (!this.state.loadingDraft) {
      this.saveDraft()
    }
  }

  keyEventToAction(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    const enterKeySends = this.props.enterKeySends

    // ENTER + SHIFT
    if (e.keyCode === 13 && e.shiftKey) {
      return 'NEWLINE'
      // ENTER + CTRL
    } else if (e.keyCode === 13 && e.ctrlKey) {
      return 'SEND'
      // ENTER
    } else if (e.keyCode === 13 && !e.shiftKey) {
      return enterKeySends ? 'SEND' : 'NEWLINE'
    }
  }

  onKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    const action = this.keyEventToAction(e)

    if (!action) return

    if (action === 'NEWLINE') {
      this.insertStringAtCursorPosition('\n')
    } else if (action === 'SEND') {
      this.props.sendMessage()
    }
    e.preventDefault()
    e.stopPropagation()
  }

  resizeTextareaAndComposer() {
    const maxScrollHeight = 9 * 24

    const el = this.textareaRef.current

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
    const { selectionStart, selectionEnd } = textareaElem
    const textValue = this.state.text

    const textBeforeCursor = textValue.slice(0, selectionStart)
    const textAfterCursor = textValue.slice(selectionEnd)

    const updatedText = textBeforeCursor + str + textAfterCursor

    this.setCursorPosition = textareaElem.selectionStart + str.length

    this.setState({ text: updatedText })
  }

  render() {
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
        placeholder={window.static_translate('write_message_desktop')}
        disabled={this.state.loadingDraft}
      />
    )
  }
}
