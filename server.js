require('dotenv').config()
const express = require('express')
const app = express()
const bcrypt = require('bcrypt')

app.use(express.json())

const jwt = require('jsonwebtoken')



const posts = [
  {
    username: 'Mark',
    title: 'Post 1'
  },
  {
    username: 'Lena',
    title: 'Post 2'
  }
]

app.get('/posts', authenticateToken, (req, res) => {

  res.json(posts.filter(post => post.username === req.user.name))
})

// app.post('/login', (req, res) => {
//   //Authenticate User
//   const username = req.body.username
// })
const users = []

// app.get('/users', (req, res) => {
//   res.json(users)
// })

// app.post('/users', async (req, res) => {
//   try {
//     // const salt = await bcrypt.genSalt()
//     // auto-gen as second argument of rounds to .hash()
//     const hashPassword = await bcrypt.hash(req.body.password, 10)
//     const user = { name: req.body.name, password: hashPassword }
//     users.push(user)
//     res.status(201).send()
//   } catch {
//     res.status(500).send()
//   }
// })

// app.post('/users/login', async (req, res) => {
//   const user = users.find(user => user.name === req.body.name)
//   if (user == null) {
//     res.status(400).send('User not found')
//   }
//   // try {
//   if (await bcrypt.compare(req.body.password, user.password)) {
//     const userData = { name: user.name }
//     const accessToken = jwt.sign(userData, process.env.ACCESS_TOKEN_SECRET)
//     res.json({ accessToken: accessToken })
//     res.send('success, generating token:')
//   } else {
//     res.send('Not allowed')
//   }
//   // } catch {
//   // res.status(500).send()
// })

function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization']
  const token = authHeader && authHeader.split(' ')[1]
  if (token === null) {
    return res.sendStatus(401)
  }
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (error, user) => {
    if (error) return res.sendStatus(403)
    req.user = user
    next()
  })
}

app.listen(3000, () => {
  console.log('Server listening on port 3000')
})