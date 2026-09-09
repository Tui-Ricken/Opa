import { useEffect, useRef, useState } from 'react'
import { io } from 'socket.io-client'
import confetti from 'canvas-confetti'

import { getNicknameColor } from './utils/getNicknameColor'

const SERVER_URL = import.meta.env.VITE_SERVER_URL

function App() {
  const [nickname, setNickname] = useState('')
  const [hasJoined, setHasJoined] = useState(false)

  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  
  const socketRef = useRef(null)
  const messagesEndRef = useRef(null)
  
  const nicknameRef = useRef(nickname)

  useEffect(() => {
    nicknameRef.current = nickname
  }, [nickname])

  useEffect(() => {
    const socket = io(SERVER_URL)
    socketRef.current = socket

    socket.on('message', (message) => {
      setMessages((prev) => [...prev, message])

      if (message.nickname !== nicknameRef.current) {
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

    if (text.startsWith('/oi')) {
      confetti()
    }

    const message = { nickname, text }

    socketRef.current?.emit('message', message)
    setInput('')
  }

  function handleKeyDown(event) {
    if (event.key === 'Enter') {
      sendMessage()
    }
  }

  function joinChat() {
    if (nickname.trim()) {
      setHasJoined(true)
    }
  }

  if (!hasJoined) {
    return (
      <div className="app">
        <header className="app-header">Chat LAN - Entrar</header>
        <div style={{ padding: 20, display: 'flex', gap: 8, justifyContent: 'center', marginTop: 50 }}>
          <input
            type="text"
            placeholder="Qual o seu nickname?"
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && joinChat()}
            style={{ padding: '10px', borderRadius: '6px', border: '1px solid #ccc' }}
          />
          <button
            onClick={joinChat}
            style={{ padding: '10px 18px', background: '#4a4ae0', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer' }}
          >
            Entrar
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="app">
      <header className="app-header">Chat LAN</header>

      <div className="messages">
        {messages.map((message, index) => (
          <div key={index} className="message">
            <span 
              className="message-nickname" 
              style={{ color: getNicknameColor(message.nickname) }}
            >
              {message.nickname}:
            </span>
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