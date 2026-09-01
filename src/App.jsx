import { useEffect, useRef, useState } from 'react'
import { io } from 'socket.io-client'

import { getNicknameColor } from './utils/getNicknameColor'

const SERVER_URL = import.meta.env.VITE_SERVER_URL

function App() {
    const [nickname, setNickname] = useState('')
    const [hasJoined, setHasJoined] = useState(false)

  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const socketRef = useRef(null)
  const messagesEndRef = useRef(null)

  useEffect(() => {
    const socket = io(SERVER_URL)
    socketRef.current = socket

    socket.on('message', (message) => {
      setMessages((prev) => [...prev, message])

        if (message.nickname !== nickname) {
          window.electronAPI?.notify(message.nickname, message.text)
        }
    })

    return () => {
      socket.disconnect()
    }
  }, [])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  function sendMessage() {
    const text = input.trim()
    if (!text) return

    const message = { text }

    socketRef.current?.emit('message', message)
    setInput('')
  }

  function handleKeyDown(event) {
    if (event.key === 'Enter') {
      sendMessage()
    }
  }

  return (
    <div className="app">
      <header className="app-header">Chat LAN</header>

      <div className="messages">
        {messages.map((message, index) => (
          <div key={index} className="message">
            {}
            <span className="message-text">{message.text}</span>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <div className="input-bar">
        <input
          type="text"
          value={input}
          onChange={(event) => setInput(event.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Digite sua mensagem..."
        />
        <button onClick={sendMessage}>Enviar</button>
      </div>
    </div>
  )
}

export default App
