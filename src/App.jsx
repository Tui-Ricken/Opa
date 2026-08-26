import { useEffect, useRef, useState } from 'react'
import { io } from 'socket.io-client'

// TODO COR: quando o nickname existir, importe e use aqui:
import { getNicknameColor } from './utils/getNicknameColor'

// TODO COMANDO: canvas-confetti já está instalado como dependência.
// Descomente o import abaixo quando for implementar o comando "/oi".
// import confetti from 'canvas-confetti'

const SERVER_URL = import.meta.env.VITE_SERVER_URL

function App() {
  // TODO NICKNAME: adicione aqui um estado para o nickname, ex:
    const [nickname, setNickname] = useState('')
    const [hasJoined, setHasJoined] = useState(false)
  // e, enquanto `hasJoined` for false, renderize uma tela simples pedindo
  // o nickname antes de mostrar o chat (troque o `return` deste componente
  // para mostrar essa tela ou o chat, condicionalmente).

  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const socketRef = useRef(null)
  const messagesEndRef = useRef(null)

  useEffect(() => {
    const socket = io(SERVER_URL)
    socketRef.current = socket

    socket.on('message', async (message) => {
      setMessages((prev) => [...prev, message])

      // TODO NOTIFICACAO: dispare uma notificação nativa quando a mensagem
      // recebida NÃO for do próprio usuário (compare `message.nickname`
      // com o nickname local). Exemplo:
      if (message.nickname !== nickname) {
        const isFocused = await window.electronAPI?.isWindowFocused()
        if (!isFocused) {
          window.electronAPI?.notify(message.nickname, message.text)
        }
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

    // TODO COMANDO: antes de emitir a mensagem, verifique se `text` começa
    // com "/oi" e, se sim, dispare o confetti() em vez de (ou além de)
    // enviar a mensagem normalmente. Exemplo:
    //   if (text.startsWith('/oi')) {
    //     confetti()
    //   }

    // TODO NICKNAME: inclua o nickname no payload quando a tela de entrada
    // estiver implementada.
  const message = { nickname, text }

    // O servidor faz broadcast da mensagem para TODOS os clientes
    // conectados (inclusive quem enviou), então não adicionamos a
    // mensagem à lista aqui — ela chega de volta pelo listener 'message'.
    socketRef.current?.emit('message', message)
    setInput('')
  }

  function handleKeyDown(event) {
    if (event.key === 'Enter') {
      sendMessage()
    }
  }

  

if (!hasJoined) {
  return (
    <div className="app">
      <header className="app-header">Opa</header>
      <form
        className="login"
        onSubmit={(event) => {
          event.preventDefault()
          if (nickname.trim()) setHasJoined(true)
        }}
      >
        <input
          type="text"
          value={nickname}
          onChange={(event) => setNickname(event.target.value)}
          placeholder="Como você quer ser chamado?"
        />
        <button type="submit">Entrar</button>
      </form>
    </div>
  )
}

return (
  <div className="app">
    <header className="app-header">Opa</header>
      <div className="messages">
        {messages.map((message, index) => (
          <div key={index} className="message">
            <span className="message-avatar">
              {message.nickname?.trim().charAt(0).toUpperCase()}
            </span>
            <span className="message-nickname"
              style={{ color: getNicknameColor(message.nickname) }}
            >{message.nickname}:</span>{' '}
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
          placeholder="Manda um Opa! 👋"
        />
        <button onClick={sendMessage}>Enviar</button>
      </div>
    </div>
  )
}

export default App
