import express from 'express'

export function CORSMiddleWare(
  _req: express.Request,
  res: express.Response,
  next: express.NextFunction
) {
  res.header('Access-Control-Allow-Origin', 'localhost')
  res.header(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept'
  )
  next()
}

export function authMiddleWare(
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) {
  if (!req.session.isAuthenticated) {
    res.status(401)
    return res.send('Not Authenticated')
  } else {
    next()
  }
}
