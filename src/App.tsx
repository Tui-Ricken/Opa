import { useEffect, useRef, useState } from 'react'
import { io, Socket } from 'socket.io-client'
import type { ChatMessage } from './types'

// TODO COR: quando o nickname existir, importe e use aqui:
// import { getNicknameColor } from './utils/getNicknameColor'

// TODO COMANDO: canvas-confetti já está instalado como dependência.
// Descomente o import abaixo quando for implementar o comando "/oi".
// import confetti from 'canvas-confetti'

const SERVER_URL = import.meta.env.VITE_SERVER_URL as string

function App() {
  // TODO NICKNAME: adicione aqui um estado para o nickname, ex:
  //   const [nickname, setNickname] = useState('')
  //   const [hasJoined, setHasJoined] = useState(false)
  // e, enquanto `hasJoined` for false, renderize uma tela simples pedindo
  // o nickname antes de mostrar o chat (troque o `return` deste componente
  // para mostrar essa tela ou o chat, condicionalmente).

  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')
  const socketRef = useRef<Socket | null>(null)
  const messagesEndRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const socket = io(SERVER_URL)
    socketRef.current = socket

    socket.on('message', (message: ChatMessage) => {
      setMessages((prev) => [...prev, message])

      // TODO NOTIFICACAO: dispare uma notificação nativa quando a mensagem
      // recebida NÃO for do próprio usuário (compare `message.nickname`
      // com o nickname local). Exemplo:
      //   if (message.nickname !== nickname) {
      //     window.electronAPI.notify(message.nickname, message.text)
      //   }
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

    // TODO NICKNAME: troque o payload abaixo para incluir o nickname, ex:
    //   const message: ChatMessage = { nickname, text }
    const message: ChatMessage = { text }

    // O servidor faz broadcast da mensagem para TODOS os clientes
    // conectados (inclusive quem enviou), então não adicionamos a
    // mensagem à lista aqui — ela chega de volta pelo listener 'message'.
    socketRef.current?.emit('message', message)
    setInput('')
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
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
            {/* TODO NICKNAME + TODO COR: quando o nickname existir, mostre-o
                antes do texto, com a cor gerada por getNicknameColor. Ex:
                  <span
                    className="message-nickname"
                    style={{ color: getNicknameColor(message.nickname) }}
                  >
                    {message.nickname}:
                  </span>{' '}
            */}
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
