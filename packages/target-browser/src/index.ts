import { existsSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import express from 'express'
import https from 'https'
import { readFile, stat } from 'fs/promises'
import session from 'express-session'
import { LocalStorage } from 'node-localstorage'
import { FileStore } from './session-store'
import { authMiddleWare, CORSMiddleWare } from './middlewares'
import { startDeltaChat } from '@deltachat/stdio-rpc-server'
import { C } from '@deltachat/jsonrpc-client'
import resolvePath from 'resolve-path'

const __dirname = dirname(fileURLToPath(import.meta.url))

// Directories & Files
const DIST_DIR = join(__dirname)
const DATA_DIR = join(__dirname, '../data')
const PRIVATE_CERTIFICATE_KEY = join(DATA_DIR, 'certificate/cert.key.pem')
const PRIVATE_CERTIFICATE_CERT = join(DATA_DIR, 'certificate/cert.pem')
const DC_ACCOUNTS_DIR = join(DATA_DIR, 'accounts')

// ENV Vars
const ENV_WEB_PASSWORD = process.env['WEB_PASSWORD']
const ENV_WEB_PORT = process.env['WEB_PORT'] || 3000
// set this to one if you use this behind a proxy
const ENV_WEB_TRUST_FIRST_PROXY = Boolean(process.env['WEB_TRUST_FIRST_PROXY'])

if (!existsSync(DATA_DIR)) {
  console.log(
    '\n[ERROR]: Data dir does not exist, make sure you follow the steps in the Readme file\n'
  )
  process.exit(1)
}

if (!existsSync(PRIVATE_CERTIFICATE_KEY)) {
  console.log(
    `\n[ERROR]: Certificate at "${PRIVATE_CERTIFICATE_KEY}" not exist, make sure you follow the steps in the Readme file\n`
  )
  process.exit(1)
}

if (!ENV_WEB_PASSWORD) {
  console.log(
    `\n[ERROR]: Environment Variable WEB_PASSWORD is not set. You need to set it.\n`
  )
  process.exit(1)
}

const app = express()

if (ENV_WEB_TRUST_FIRST_PROXY) {
  app.set('trust proxy', 1)
}

const localStorage = new LocalStorage(join(DATA_DIR, 'browser-runtime-data'))

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

app.use(
  session({
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
)

app.use(CORSMiddleWare)

app.get('/', (req, res) => {
  if (req.session.isAuthenticated) {
    res.sendFile(join(DIST_DIR, 'main.html'))
  } else {
    res.status(401)
    return res.sendFile(join(DIST_DIR, 'login.html')) // TODO some nice site
  }
})

app.use(express.static(DIST_DIR))

app.post(
  '/authenticate',
  express.urlencoded({ extended: true }),
  (req, res) => {
    // check password
    if (req.body?.password === ENV_WEB_PASSWORD) {
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

const dc = await startDeltaChat(DC_ACCOUNTS_DIR)
console.log(await dc.rpc.getSystemInfo())

app.get('/blobs/:accountId/:filename', authMiddleWare, async (req, res) => {
  const { accountId, filename } = req.params
  if (isNaN(Number(accountId))) {
    return res.status(400).send('Bad Request: account id is not a number')
  }
  const blobDir = await dc.rpc.getBlobDir(Number(req.params.accountId))
  if (!blobDir) {
    throw new Error('no blobdir')
  }
  const filePath = resolvePath(blobDir, filename)

  try {
    // test if file exists
    await stat(filePath)
  } catch (error) {
    return res.status(404).send('404 Not Found')
  }

  res.sendFile(filePath)
})

// TODO
app.get('/stickers/:account/:?pack/:filename', authMiddleWare, (req, res) => {
  //TODO (also not sure how to make the pack optional)
  res.send('req.params' + JSON.stringify(req.params))
})

const sslserver = https.createServer(
  {
    key: await readFile(PRIVATE_CERTIFICATE_KEY),
    cert: await readFile(PRIVATE_CERTIFICATE_CERT),
  },
  app
)

sslserver.listen(ENV_WEB_PORT, () => {
  console.log(`HTTPS app listening on port ${ENV_WEB_PORT}`)
})

process.on('exit', () => {
  sslserver.closeAllConnections()
  sslserver.close()
  dc.close()
})
