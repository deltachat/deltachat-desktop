const React = require('react')
const styled = require('styled-components').default
const chatListStore = require('../stores/chatList')
const debounce = require('debounce')

const MessageInputTextarea = styled.textarea`
  float: left;
  width: calc(100% - 120px);
  resize: unset;
  padding: 0px;
  border-color: transparent;
  border-width: 0px;
  height: auto;
  line-height: 24px;
  margin-top: 8px;
  margin-bottom: 8px;
  margin-left: 40px;
  overflow-y: hidden;
  background-color: ${props => props.theme.composerBg};

  &:focus {
    outline: none;
  }

  &.scroll {
    overflow-y: scroll;
  }`

class ComposerMessageInput extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      text: props.draft ? props.draft : '',
      chatId: props.chatId
    }

    this.composerSize = 48
    this.setComposerSize = this.setComposerSize.bind(this)
    this.setCursorPosition = false
    this.onKeyDown = this.onKeyDown.bind(this)
    this.onChange = this.onChange.bind(this)
    this.insertStringAtCursorPosition = this.insertStringAtCursorPosition.bind(this)

    this.saveDraft = debounce(() => {
      const { text, chatId } = this.state
      chatListStore.dispatch({ type: 'UI_SET_DRAFT', payload: { text, chatId } })
    }, 500)

    this.textareaRef = React.createRef()
  }

  static getDerivedStateFromProps (props, currentState) {
    if (currentState.chatId !== props.chatId) {
      return { chatId: props.chatId, text: props.draft ? props.draft : '' }
    }
    return null
  }

  setComposerSize (size) {
    this.composerSize = size
    this.props.setComposerSize(size)
  }

  focus () {
    this.textareaRef.current.focus()
  }

  getText () {
    return this.state.text
  }

  clearText () {
    this.setState({ text: '' })
  }

  componentDidUpdate (prevProps, prevState) {
    if (this.setCursorPosition) {
      this.textareaRef.current.selectionStart = this.setCursorPosition
      this.textareaRef.current.selectionEnd = this.setCursorPosition

      // Focus on the current selection, hack for focusing on newlines
      this.textareaRef.current.blur()
      this.textareaRef.current.focus()

      this.setCursorPosition = false
    }

    if (prevState.text !== this.state.text) {
      this.resizeTextareaAndComposer()
      this.saveDraft()
    }
  }

  onChange (e) {
    this.setState({ text: e.target.value, error: false })
    this.saveDraft()
  }

  keyEventToAction (e) {
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

  onKeyDown (e) {
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

  resizeTextareaAndComposer () {
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

  insertStringAtCursorPosition (str) {
    const textareaElem = this.textareaRef.current
    const { selectionStart, selectionEnd } = textareaElem
    const textValue = this.state.text

    const textBeforeCursor = textValue.slice(0, selectionStart)
    const textAfterCursor = textValue.slice(selectionEnd)

    const updatedText = textBeforeCursor + str + textAfterCursor

    this.setCursorPosition = textareaElem.selectionStart + str.length

    this.setState({ text: updatedText })
  }

  render () {
    const tx = window.translate

    return (
      <MessageInputTextarea
        ref={this.textareaRef}
        rows='1'
        intent={this.state.error ? 'danger' : 'none'}
        large
        value={this.state.text}
        onKeyDown={this.onKeyDown}
        onChange={this.onChange}
        placeholder={tx('write_message_desktop')}
      />
    )
  }
}

module.exports = ComposerMessageInput
