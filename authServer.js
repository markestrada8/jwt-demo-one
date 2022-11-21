require('dotenv').config()
const express = require('express')
const app = express()
const bcrypt = require('bcrypt')

app.use(express.json())

const jwt = require('jsonwebtoken')

// TYPICALLY HANDLE REFRESH TOKENS WITH REDIS CACHE

let refreshTokens = []

app.post('/token', (req, res) => {
  const refreshToken = req.body.token
  if (refreshToken === null) return res.sendStatus(401)
  if (!refreshTokens.includes(refreshToken)) return res.sendStatus(403)
  jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (error, user) => {
    if (error) return res.sendStatus(403)
    const accessToken = generateAccessToken({ name: user.name })
    res.json({ accessToken: accessToken })
  })
})


const users = []

app.get('/users', (req, res) => {
  res.json(users)
})

app.post('/users', async (req, res) => {
  try {
    // const salt = await bcrypt.genSalt()
    // auto-gen as second argument of rounds to .hash()
    const hashPassword = await bcrypt.hash(req.body.password, 10)
    const user = { name: req.body.name, password: hashPassword }
    users.push(user)
    res.status(201).send()
  } catch {
    res.status(500).send()
  }
})

app.delete('/logout', (req, res) => {
  refreshTokens = refreshTokens.filter(token => token !== req.body.token)
  res.sendStatus(204)
})

app.post('/users/login', async (req, res) => {
  const user = users.find(user => user.name === req.body.name)
  if (user == null) {
    res.status(400).send('User not found')
  }
  try {
    if (await bcrypt.compare(req.body.password, user.password)) {
      const userData = { name: user.name }

      const accessToken = generateAccessToken(userData)
      const refreshToken = jwt.sign(user, process.env.REFRESH_TOKEN_SECRET)

      refreshTokens.push(refreshToken)

      res.json({ accessToken: accessToken, refreshToken: refreshToken })
      // res.send('success, generating token:')
    } else {
      res.send('Not allowed')
    }
  } catch {
    res.status(500).send()
  }
})

// function authenticateToken(req, res, next) {
//   const authHeader = req.headers['authorization']
//   const token = authHeader && authHeader.split(' ')[1]
//   if (token === null) {
//     return res.sendStatus(401)
//   }
//   jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (error, user) => {
//     if (error) return res.sendStatus(403)
//     req.user = user
//     next()
//   })
// }

function generateAccessToken(user) {
  return jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '30s' })
}

app.listen(4000, () => {
  console.log('Server listening on port 4000')
})