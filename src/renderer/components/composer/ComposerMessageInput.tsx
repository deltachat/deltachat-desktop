import React from 'react'
import debounce from 'debounce'
import moment from 'moment'
import { ActionEmitter, KeybindAction } from '../../keybindings'
import { getLogger } from '../../../shared/logger'

const log = getLogger('renderer/composer/ComposerMessageInput')

type ComposerMessageInputProps = {
  chatId: number
  sendMessage: () => void
  enterKeySends: boolean
  onPaste?: (e: React.ClipboardEvent<HTMLTextAreaElement>) => void
  updateDraftText: (text: string, InputChatId: number) => void
  saveVoiceAsDraft: (voiceData: Blob) => void
}

type ComposerMessageInputState = {
  text: string
  chatId: number
  // error?:boolean|Error
  loadingDraft: boolean
  recordedDuration: moment.Duration | null
}

export default class ComposerMessageInput extends React.Component<
  ComposerMessageInputProps,
  ComposerMessageInputState
> {
  composerSize: number
  setCursorPosition: number | false
  textareaRef: React.RefObject<HTMLTextAreaElement>
  saveDraft: () => void
  recorder: MediaRecorder | null = null
  updateRecordedDurationInterval: number | null = null
  voiceData: Blob[] = []
  constructor(props: ComposerMessageInputProps) {
    super(props)
    this.state = {
      text: '',
      chatId: props.chatId,
      loadingDraft: true,
      recordedDuration: null,
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
      this.props.updateDraftText(text.trim() === '' ? '' : text, chatId)
    }, 1000)

    this.textareaRef = React.createRef()
    this.focus = this.focus.bind(this)
    this.isRecording = this.isRecording.bind(this)
    this.startRecording = this.startRecording.bind(this)
    this.stopRecording = this.stopRecording.bind(this)
    this.hasText = this.hasText.bind(this)
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

  setText(text: string | null) {
    this.setState({ text: text || '', loadingDraft: false })
  }

  setComposerSize(size: number) {
    this.composerSize = size
  }

  focus() {
    log.debug('Focus composer message input')
    setTimeout(() => this.textareaRef?.current?.focus())
  }

  getText() {
    return this.state.text
  }

  clearText() {
    this.setState({ text: '' })
  }

  hasText(): boolean {
    return !Boolean(this.getText().match(/^\s*$/))
  }

  startRecording() {
    navigator.mediaDevices
      .getUserMedia({ audio: true, video: false })
      .then(stream => {
        this.recorder = new MediaRecorder(stream, { mimeType: 'audio/webm;codecs=opus' })
        this.recorder.onstart = () => {
          this.updateRecordedDurationInterval = window.setInterval(
            () =>
              this.setState(prevState => {
                const recordedDuration =
                  prevState.recordedDuration?.clone() || moment.duration()
                recordedDuration.add(0.1, 's')
                return { recordedDuration: recordedDuration }
              }),
            100
          )
        }
        this.recorder.ondataavailable = (evt: BlobEvent) => {
          this.voiceData.push(evt.data)
          if (this.recorder?.state !== 'inactive') {
            return
          }
          const voiceData = this.getVoiceData()
          if (!voiceData) {
            log.error('No voice data available after recording')
            // show alert dialogue
            return
          }
          if (voiceData.size === 0) {
            log.error('voice data is available but size of blob is zero')
            // show alert dialogue
            return
          }
          this.props.saveVoiceAsDraft(voiceData)
        }
        this.recorder.onstop = () => {
          const duration = this.state.recordedDuration?.asSeconds() || 0
          if (duration === 0)
            log.error(
              'duration of voice is zero while the mediarecorder has stopped. this must not happen'
            )
          this.setState({ recordedDuration: null })

          this.updateRecordedDurationInterval &&
            window.clearInterval(this.updateRecordedDurationInterval)
        }
        this.recorder.start()
      })
      .catch((_reason: any) => {
        // Show alert dialog with reason. say that you cannot capture mic
      })
  }

  stopRecording() {
    if (this.recorder?.state === 'recording') {
      this.recorder?.stop()
    }
  }

  isRecording() {
    return Boolean(this.recorder?.state === 'recording')
  }

  getVoiceData(): Blob {
    const voiceData = new Blob(this.voiceData)
    this.voiceData = []
    return voiceData
  }

  componentDidUpdate(
    _prevProps: ComposerMessageInputProps,
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
        if (window.__hasOpenDialogs()) {
          this.textareaRef.current.blur()
          this.textareaRef.current.focus()
        }
      }

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
    if (e.key === 'Enter' && e.shiftKey) {
      return 'NEWLINE'
      // ENTER + CTRL
    } else if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      return 'SEND'
      // ENTER
    } else if (e.key === 'Enter' && !e.shiftKey) {
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
  }

  render() {
    const { recordedDuration, text, loadingDraft } = this.state
    if (recordedDuration) {
      return <RecordingDuration duration={recordedDuration} />
    } else {
      return (
        <textarea
          className='message-input-area'
          id='composer-textarea'
          ref={this.textareaRef}
          rows={1}
          // intent={this.state.error ? 'danger' : 'none'}
          // large
          value={text}
          onKeyDown={this.onKeyDown}
          onChange={this.onChange}
          onPaste={this.props.onPaste}
          placeholder={window.static_translate('write_message_desktop')}
          disabled={loadingDraft}
          dir='auto'
          spellCheck={true}
        />
      )
    }
  }
}

function RecordingDuration({ duration }: { duration: moment.Duration }) {
  let minutes = duration.asMinutes()
  const seconds = Math.ceil((minutes - Math.floor(minutes)) * 60)
  minutes = Math.floor(minutes)
  return (
    <div className='recording-duration'>
      <p>
        {minutes} : {seconds}
      </p>
    </div>
  )
}
