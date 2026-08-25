import express from 'express'
import { createServer } from 'node:http'
import { Server } from 'socket.io'

const PORT = 3000

const app = express()
const httpServer = createServer(app)

// CORS liberado pra qualquer origem: é um projeto de sala de aula rodando
// em rede local, sem autenticação nem dados sensíveis.
const io = new Server(httpServer, {
  cors: {
    origin: '*',
  },
})

app.get('/', (_req, res) => {
  res.send('Servidor de chat rodando.')
})

io.on('connection', (socket) => {
  console.log(`Cliente conectado: ${socket.id}`)

  // Tudo em memória: recebe uma mensagem de um cliente e repassa (broadcast)
  // para todos os clientes conectados, inclusive quem enviou.
  socket.on('message', (message) => {
    io.emit('message', message)
  })

  socket.on('disconnect', () => {
    console.log(`Cliente desconectado: ${socket.id}`)
  })
})

httpServer.listen(PORT, () => {
  console.log(`Servidor de chat escutando em http://localhost:${PORT}`)
})
