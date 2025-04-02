import Encoder from './Encoder'

interface MicRecorderConfig {
  bitRate?: number
  startRecordingAt?: number
  deviceId?: string | null
  sampleRate?: number
}

class MicRecorder {
  private config: MicRecorderConfig
  private activeStream: MediaStream | null
  private context: AudioContext | null
  private microphone: MediaStreamAudioSourceNode | null
  private processor: ScriptProcessorNode | null
  private startTime: number
  private timerToStart?: number
  private lameEncoder: Encoder | null

  constructor(config: MicRecorderConfig = {}) {
    this.config = {
      bitRate: 128,
      startRecordingAt: 300,
      deviceId: null,
      ...config,
    }

    this.activeStream = null
    this.context = null
    this.microphone = null
    this.processor = null
    this.startTime = 0
    this.lameEncoder = null
  }

  /**
   * Starts to listen for the microphone sound
   * @param {MediaStream} stream
   */
  private addMicrophoneListener(stream: MediaStream): void {
    this.activeStream = stream

    // This prevents the weird noise once you start listening to the microphone
    this.timerToStart = window.setTimeout(() => {
      delete this.timerToStart
    }, this.config.startRecordingAt)

    // Set up Web Audio API to process data from the media stream (microphone).
    if (!this.context) {
      throw new Error('AudioContext is not initialized.')
    }

    this.microphone = this.context.createMediaStreamSource(stream)

    // Settings a bufferSize of 0 instructs the browser to choose the best bufferSize
    this.processor = this.context.createScriptProcessor(0, 1, 1)

    // Add all buffers from LAME into an array.
    this.processor.onaudioprocess = (event: AudioProcessingEvent) => {
      if (this.timerToStart) {
        return
      }

      if (this.lameEncoder) {
        // Send microphone data to LAME for MP3 encoding while recording.
        this.lameEncoder.encode(event.inputBuffer.getChannelData(0))
      }
    }

    // Begin retrieving microphone data.
    this.microphone.connect(this.processor)
    this.processor.connect(this.context.destination)
  }

  /**
   * Disconnect microphone, processor and remove activeStream
   */
  stop(): this {
    if (this.processor && this.microphone) {
      // Clean up the Web Audio API resources.
      this.microphone.disconnect()
      this.processor.disconnect()

      if (this.context && this.context.state !== 'closed') {
        this.context.close()
      }

      this.processor.onaudioprocess = null

      if (this.activeStream) {
        // Stop all audio tracks. Also, removes recording icon from chrome tab
        this.activeStream.getAudioTracks().forEach(track => track.stop())
      }
    }

    return this
  }

  /**
   * Requests access to the microphone and start recording
   * @return Promise<MediaStream>
   */
  start(): Promise<MediaStream> {
    const AudioContext =
      window.AudioContext || (window as any).webkitAudioContext
    this.context = new AudioContext()
    this.config.sampleRate = this.context.sampleRate
    this.lameEncoder = new Encoder(this.config)

    const audio = this.config.deviceId
      ? { deviceId: { exact: this.config.deviceId } }
      : true

    return new Promise((resolve, reject) => {
      navigator.mediaDevices
        .getUserMedia({ audio })
        .then(stream => {
          this.addMicrophoneListener(stream)
          resolve(stream)
        })
        .catch(err => {
          reject(err)
        })
    })
  }

  /**
   * Return Mp3 Buffer and Blob with type mp3
   * @return {Promise<[Int8Array[], Blob]>}
   */
  getMp3(): Promise<[Int8Array[], Blob]> {
    if (!this.lameEncoder) {
      return Promise.reject(new Error('LAME encoder is not initialized.'))
    }

    const finalBuffer = this.lameEncoder.finish()

    return new Promise((resolve, reject) => {
      if (finalBuffer.length === 0) {
        reject(new Error('No buffer to send'))
      } else {
        resolve([finalBuffer, new Blob(finalBuffer, { type: 'audio/mp3' })])
        this.lameEncoder?.clearBuffer()
      }
    })
  }
}

export default MicRecorder
