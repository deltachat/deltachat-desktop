import { basename, dirname, join } from 'path'
import express from 'express'
import https from 'https'
import { readFile, stat, unlink } from 'fs/promises'
import session from 'express-session'
import { FileStore } from './session-store'
import { authMiddleWare, CORSMiddleWare } from './middlewares'
import resolvePath from 'resolve-path'
import { WebSocketServer } from 'ws'
import { BackendApiRoute } from './backendApi'
import { MessageToBackend } from './runtime-ws-protocol'

// This import has side effects, it will quit the app if env vars or files are missing
import {
  ENV_WEB_TRUST_FIRST_PROXY,
  DIST_DIR,
  ENV_WEB_PASSWORD,
  NODE_ENV,
  ENV_WEB_PORT,
  PRIVATE_CERTIFICATE_CERT,
  PRIVATE_CERTIFICATE_KEY,
  localStorage,
  LOCALES_DIR,
  DATA_DIR,
  DC_ACCOUNTS_DIR,
} from './config'
import { startDeltaChat } from './deltachat-rpc'
import { helpRoute } from './help'
import { cleanupLogFolder, createLogHandler } from './log-handler'
import { getLogger, setLogHandler } from '@deltachat-desktop/shared/logger'
import { RCConfig } from './rc-config'
import { readThemeDir } from './themes'

const logHandler = createLogHandler()
setLogHandler(logHandler.log, RCConfig)
cleanupLogFolder()
const log = getLogger('main')

const app = express()

if (ENV_WEB_TRUST_FIRST_PROXY) {
  app.set('trust proxy', 1)
}

const getCookieSecret = () => {
  const savedSecret = localStorage.getItem('cookieSecret')
  if (savedSecret) {
    return savedSecret
  } else {
    const newSecret = crypto.randomUUID()
    localStorage.setItem('cookieSecret', newSecret)
    return newSecret
  }
}

const sessionParser = session({
  store: new FileStore(localStorage),
  secret: getCookieSecret(),
  resave: false,
  saveUninitialized: true,
  cookie: {
    sameSite: 'strict',
    priority: 'high',
    secure: true, // This makes it only work in https
    httpOnly: true,
  },
})

app.use(sessionParser)

app.use(CORSMiddleWare)

app.get('/', (req, res) => {
  let startPage = 'main.html'
  if (NODE_ENV === 'test') {
    req.session.isAuthenticated = true
    startPage = 'test.html'
  }
  if (req.session.isAuthenticated) {
    res.sendFile(join(DIST_DIR, startPage))
  } else {
    res.status(401)
    return res.sendFile(join(DIST_DIR, 'login.html')) // TODO some nice site
  }
})

app.use(express.static(DIST_DIR))
app.use('/locales', express.static(LOCALES_DIR))

app.get('/favicon.ico', (_req, res) =>
  res.sendFile(join(DIST_DIR, 'images/deltachat.ico'))
)

app.post(
  '/authenticate',
  express.urlencoded({ extended: true }),
  (req, res) => {
    if (req.body?.password === ENV_WEB_PASSWORD) {
      // check password
      req.session.isAuthenticated = true
      // redirect to root (/)
      res.redirect('/')
    } else {
      res.status(401)
      return res.send(`<html>
    <head></head>
    <body>
        Password wrong, <a href="/">go back to login</a>
    </body>
    </html>`)
    }
  }
)

app.get('/logout', (req, res) => {
  req.session.destroy(() => {})
  res.redirect('/')
})

const [dc, wssDC, shutdownDC] = await startDeltaChat()
log.info(await dc.rpc.getSystemInfo())

app.get('/blobs/:accountId/:filename', authMiddleWare, async (req, res) => {
  const { filename } = req.params
  let { accountId } = req.params

  if (isNaN(Number(accountId))) {
    // workaround until core gives out relative urls
    for (const id of await dc.rpc.getAllAccountIds()) {
      const blobdir = (await dc.rpc.getBlobDir(id)) || ''
      if (basename(dirname(blobdir)) === accountId) {
        accountId = String(id)
        break
      }
    }

    if (isNaN(Number(accountId))) {
      return res.status(400).send('Bad Request: account id is not a number')
    }
  }

  const blobDir = await dc.rpc.getBlobDir(Number(accountId))
  if (!blobDir) {
    throw new Error('no blobdir')
  }
  const filePath = resolvePath(blobDir, filename)

  try {
    // test if file exists
    await stat(filePath)
  } catch (_error) {
    return res.status(404).send('404 Not Found')
  }

  if (req.query.download_with_filename) {
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="${req.query.download_with_filename}"`
    )
  }
  res.sendFile(filePath)
})

app.get('/download-backup/:filename', authMiddleWare, async (req, res) => {
  const filePath = resolvePath(
    join(DC_ACCOUNTS_DIR, 'backups'),
    req.params.filename
  )
  res.download(filePath)
  res.on('finish', () => {
    setTimeout(() => {
      unlink(filePath).then(() => {
        log.info('deleted backup file 10s after download')
      })
    }, 10000)
  })
})

// TODO
app.get('/stickers/:account/:?pack/:filename', authMiddleWare, (req, res) => {
  //TODO (also not sure how to make the pack optional)
  res.send('req.params' + JSON.stringify(req.params))
})

app.use('/background', express.static(join(DATA_DIR, 'background')))

app.use('/backend-api', BackendApiRoute)
app.use(helpRoute)

app.get('/themes.json', async (_req, res) => {
  res.json(await readThemeDir())
})

let certificate = ''
if (process.env.PRIVATE_CERTIFICATE_CERT) {
  certificate = process.env.PRIVATE_CERTIFICATE_CERT
} else {
  certificate = await readFile(PRIVATE_CERTIFICATE_CERT, 'utf8')
}

let certificateKey = ''
if (process.env.PRIVATE_CERTIFICATE_KEY) {
  certificateKey = process.env.PRIVATE_CERTIFICATE_KEY
} else {
  certificateKey = await readFile(PRIVATE_CERTIFICATE_KEY, 'utf8')
}

const sslserver = https.createServer(
  {
    key: certificateKey,
    cert: certificate,
  },
  app
)

const wssBackend = new WebSocketServer({
  noServer: true,
  perMessageDeflate: true,
})
wssBackend.on('connection', function connection(ws) {
  ws.on('error', log.error.bind(log))

  ws.on('message', raw_data => {
    try {
      // Try to decode the binary data as a UTF-8 string
      const utf8String = raw_data.toString('utf8')
      const msg: MessageToBackend.AllTypes = JSON.parse(utf8String)
      if (msg.type == 'log') {
        const [channel, level, stackTrace, ...data] = msg.data
        // /* ignore-console-log */
        // console.debug("frontend", channel, level, data[0], '[..]')
        logHandler.log(channel, level as any, stackTrace, ...data)
      } else {
        log.debug('[recv on backend ws]', msg)
      }
    } catch (e) {
      log.error('failed to read message as json string', e)
    }
  })

  log.debug('connected backend socket')
})

sslserver.on('upgrade', (request, socket, head) => {
  // eslint-disable-next-line no-console
  socket.on('error', console.error)

  sessionParser(request as any, {} as any, () => {
    if (!(request as express.Request).session.isAuthenticated) {
      log.debug('unauthorized websocket session')
      socket.write('HTTP/1.1 401 Unauthorized\r\n\r\n')
      socket.destroy()
      return
    }
    const { pathname } = new URL(request.url || '', 'wss://base.url')
    if (pathname === '/ws/dc') {
      wssDC.handleUpgrade(request, socket, head, function (ws) {
        wssDC.emit('connection', ws, request)
      })
    } else if (pathname === '/ws/backend') {
      wssBackend.handleUpgrade(request, socket, head, function (ws) {
        wssBackend.emit('connection', ws, request)
      })
    }
  })
})

sslserver.listen(ENV_WEB_PORT, () => {
  log.info(`HTTPS app listening on port ${ENV_WEB_PORT}`)
})

process.on('exit', () => {
  sslserver.closeAllConnections()
  sslserver.close()
  shutdownDC()
  logHandler.end()
})
