//@ts-check

type SendingStatusUpdate<T> = {
  /** the payload, deserialized json:
   * any javascript primitive, array or object. */
  payload: T
  /** optional, short, informational message that will be added to the chat,
   * eg. "Alice voted" or "Bob scored 123 in MyGame";
   * usually only one line of text is shown,
   * use this option sparingly to not spam the chat. */
  info?: string
  /** optional, if the Webxdc creates a document, you can set this to the name of the document;
   * do not set if the Webxdc does not create a document */
  document?: string
  /** optional, short text, shown beside the icon;
   * it is recommended to use some aggregated value,
   * eg. "8 votes", "Highscore: 123" */
  summary?: string
}

type ReceivedStatusUpdate<T> = {
  /** the payload, deserialized json */
  payload: T
  /** the serial number of this update. Serials are larger than 0 and newer serials have higher numbers */
  serial: number
  /** the maximum serial currently known */
  max_serial: number
  /** optional, short, informational message. */
  info?: string
  /** optional, if the Webxdc creates a document, this is the name of the document;
   * not set if the Webxdc does not create a document */
  document?: string
  /** optional, short text, shown beside the webxdc's icon. */
  summary?: string
}

type XDCFile = {
  /** name of the file, including extension */
  name: string
} & (
  | {
      /** Blob, also accepts inherit types like File */
      blob: Blob
    }
  | {
      /** base64 encoded file data */
      base64: string
    }
  | {
      /** text for textfile, will be encoded as utf8 */
      plainText: string
    }
)

type SendOptions =
  | {
      file: XDCFile
      text?: string
    }
  | {
      file?: XDCFile
      text: string
    }

interface Webxdc<T> {
  /** Returns the peer's own address.
   *  This is esp. useful if you want to differ between different peers - just send the address along with the payload,
   *  and, if needed, compare the payload addresses against selfAddr() later on. */
  selfAddr: string
  /** Returns the peer's own name. This is name chosen by the user in their settings, if there is nothing set, that defaults to the peer's address. */
  selfName: string
  /**
   * set a listener for new status updates.
   * The "serial" specifies the last serial that you know about (defaults to 0).
   * Note that own status updates, that you send with {@link sendUpdate}, also trigger this method
   * @returns promise that resolves when the listener has processed all the update messages known at the time when `setUpdateListener` was called.
   * */
  setUpdateListener(
    cb: (statusUpdate: ReceivedStatusUpdate<T>) => void,
    serial?: number
  ): Promise<void>
  /**
   * @deprecated See {@link setUpdateListener|`setUpdateListener()`}.
   */
  getAllUpdates(): Promise<ReceivedStatusUpdate<T>[]>
  /**
   * Webxdc are usually shared in a chat and run independently on each peer. To get a shared status, the peers use sendUpdate() to send updates to each other.
   * @param update status update to send
   * @param description short, human-readable description what this update is about. this is shown eg. as a fallback text in an email program.
   */
  sendUpdate(update: SendingStatusUpdate<T>, description: string): void
  /**
   * Send a message with file, text or both to a chat.
   * Asks user to what Chat to send the message to.
   * May exit the xdc, please save your app state before calling this function.
   * @param message
   * @returns promise that may not resolve (because the xdc closes) and is rejected on error.
   */
  sendToChat(message: SendOptions): Promise<void>
  /**
   * Asks the user to choose files.
   * This either opens a normal file picker (like `<input type=file>`) or an integrated Filepicker if the ui has implemented it.
   * This custom file picker should show files that were recently send or received in chats,
   * but also show a button to open the normal file picker.
   */
  importFiles(filter: {
    /**
     * mimetypes as in https://developer.mozilla.org/en-US/docs/Web/HTML/Attributes/accept#unique_file_type_specifiers
     */
    mimeTypes?: string[]
    /** only show files with these extensions.
     * All extensions need to start with a dot and have the format `.ext`. */
    extensions?: string[]
    /** false by default, whether to allow multiple files to be selected */
    multiple?: boolean
  }): Promise<File[]>
}

////////// ANCHOR: global
declare global {
  interface Window {
    webxdc: Webxdc<any>
  }
}
////////// ANCHOR_END: global

export { SendingStatusUpdate, ReceivedStatusUpdate, Webxdc, XDCFile }
