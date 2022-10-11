import SplitOut from './splitout'
import { mkdtemp, writeFile } from 'fs/promises'
import { tmpdir } from 'os'
import { join } from 'path'

export default class DCMessageList extends SplitOut {
  /** @returns file path to html file */
  async saveMessageHTML2Disk(messageId: number): Promise<string> {
    const message_html_content = this.selectedAccountContext.getMessageHTML(
      messageId
    )
    const tmpDir = await mkdtemp(join(tmpdir(), 'deltachat-'))
    const pathToFile = join(tmpDir, 'message.html')
    await writeFile(pathToFile, message_html_content, { encoding: 'utf-8' })
    return pathToFile
  }
}
