/**
 * This file is based on https://github.com/closeio/mic-recorder-to-mp3/blob/master/src/mic-recorder.js
 *
 * @license MIT Copyright (c) 2017 Elastic Inc. (Close.io) see ./LICENSE
 */

import Encoder from './Encoder'

interface MicRecorderConfig {
  bitRate?: number
  startRecordingAt?: number
  deviceId?: string | null
  sampleRate?: number
}

/**
 * This class does not use MediaRecorder API since at
 * the time of writing Chrome only supported the audio
 * codec weba (Web Audio) which is not supported by iOS
 */
class MicRecorder {
  public audioSignalDetected: boolean = false
  private onVolumeChange: (volume: number) => void
  private config: MicRecorderConfig
  private activeStream: MediaStream | null
  private context: AudioContext | null
  private microphone: MediaStreamAudioSourceNode | null
  private processor: ScriptProcessorNode | null
  private timerToStart?: number
  private lameEncoder: Encoder | null

  constructor(
    onVolumeChange: (volume: number) => void,
    config: MicRecorderConfig = {}
  ) {
    this.config = {
      bitRate: 128,
      startRecordingAt: 300,
      deviceId: null,
      ...config,
    }
    this.onVolumeChange = onVolumeChange
    this.activeStream = null
    this.context = null
    this.microphone = null
    this.processor = null
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
      this.calculateVolume(event.inputBuffer.getChannelData(0))
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
        resolve([
          finalBuffer,
          new Blob(
            finalBuffer.map(buffer => new Uint8Array(buffer)),
            { type: 'audio/mp3' }
          ),
        ])
        this.lameEncoder?.clearBuffer()
      }
    })
  }

  /**
   * Return the volume of the microphone
   * @return {number}
   */
  calculateVolume(input: any) {
    let sum = 0.0
    for (let i = 0; i < input.length; ++i) {
      sum += input[i] * input[i]
    }
    if (sum > 0) {
      this.audioSignalDetected = true
    }
    this.onVolumeChange(Math.sqrt(sum / input.length))
  }
}

export default MicRecorder
