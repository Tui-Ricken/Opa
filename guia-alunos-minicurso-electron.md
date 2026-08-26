# Minicurso Electron — Chat Local em Rede (3h)

## Visão geral

Os alunos recebem um chat funcional (conecta, manda e recebe mensagem) e
constroem 7 tarefas em cima disso, da mais simples pra mais complexa. Cada
tarefa é independente — se alguém atrasar numa, ainda consegue acompanhar a
próxima.

**Pronto (entregue no início):**
- Janela Electron abrindo, processo main + preload configurados
  (`electron/main.js`, `electron/preload.js`)
- Conexão Socket.IO com o servidor (`src/App.jsx`)
- Lista de mensagens + campo de input funcionando (texto puro, sem
  nome/cor/avatar)
- `preload.js` já expõe `window.electronAPI.notify(title, body)` e o
  `App.jsx` já chama essa função quando chega mensagem de outra pessoa —
  falta só o resto (nickname no payload, cor, avatar, comando, notificação
  personalizada)
- `src/utils/getNicknameColor.js` já existe com a assinatura da função e um
  comentário explicando o algoritmo, mas o corpo é um stub (`return
  '#333333'`) — é o ponto de partida da Tarefa 4

**To-do (eles constroem, nessa ordem):**
1. Nome da janela: "Chat LAN" → "Opa"
2. Placeholder do input + cor do botão
3. Nickname + avatar
4. Cor por usuário
5. Notificação nativa
6. Comando `/oi`
7. Notificação personalizada com padrão Observer (som/visual)

---

## Bloco 0 — Abertura (15 min)

- Explique rapidamente: Electron = Chromium + Node.js rodando junto. Por isso
  dá pra ter notificação nativa, tray icon, acesso a arquivo — coisa que um
  site normal não faz.
- Mostre os 3 processos: **main** (`electron/main.js`, controla a janela),
  **preload** (`electron/preload.js`, ponte segura entre main e renderer),
  **renderer** (`src/App.jsx`, é o React normal que eles já conhecem).
- Rode o projeto pronto na tela (`npm run dev`), todo mundo conectado no
  mesmo servidor, mande uma mensagem pra provar que funciona.
- Passe o IP do servidor pro pessoal configurar no `.env` deles
  (`VITE_SERVER_URL=http://192.168.x.x:3000`, baseado no `.env.example`).

**Tela branca / janela do Electron não abre?** Se alguém rodar `npm run dev`
pelo terminal integrado do VS Code (ou de dentro de qualquer app baseada em
Electron), o processo herda a variável `ELECTRON_RUN_AS_NODE=1` do processo
pai. Isso faz o `electron.exe` subir como Node puro em vez de Electron de
verdade — `ipcMain`, `BrowserWindow` etc. ficam `undefined` e o processo
main quebra antes de abrir a janela (dá pra confirmar no terminal: erro
`Cannot read properties of undefined (reading 'on')` em `dist-electron/main.js`).
O projeto já vem com a correção em `vite.config.js`
(`delete process.env.ELECTRON_RUN_AS_NODE` antes de subir o plugin do
Electron), mas se algum aluno tiver um `vite.config.js` mais antigo ou
customizado, vale checar isso primeiro antes de sair depurando o React.

---

## Tarefa 1 — Nome da janela: "Chat LAN" → "Opa" (10 min)

**O que fazer:** o app hoje se chama "Chat LAN" em dois lugares: o título da
aba/janela e o cabeçalho visível dentro do chat. É a tarefa mais simples só
pra todo mundo já editar um arquivo e ver o resultado na tela antes de
partir pras tarefas com lógica.

**Onde mexer:**

`index.html` (linha 6) — controla o título que aparece na barra da janela:

```html
<!-- antes -->
<title>Chat LAN</title>

<!-- depois -->
<title>Opa</title>
```

`src/App.jsx` (linha 80) — controla o texto do cabeçalho dentro do app:

```jsx
{/* antes */}
<header className="app-header">Chat LAN</header>

{/* depois */}
<header className="app-header">Opa</header>
```

**Bônus:** em `electron/main.js`, dentro de `new BrowserWindow({...})`,
adicionar `title: 'Opa'` evita que a janela mostre um título em branco por
um instante antes do `index.html` carregar:

```js
mainWindow = new BrowserWindow({
  width: 900,
  height: 700,
  title: 'Opa',
  webPreferences: {
    preload: path.join(__dirname, 'preload.js'),
    contextIsolation: true,
    nodeIntegration: false,
  },
})
```

**Checkpoint:** a janela e o cabeçalho do chat mostram "Opa" em vez de "Chat
LAN".

---

## Tarefa 2 — Placeholder do input e cor do botão (15 min)

**O que fazer:** trocar o texto de exemplo do campo de mensagem e a cor do
botão "Enviar", pra fixar onde fica estilo (CSS) e onde fica estrutura
(JSX) num componente React.

**Onde mexer:**

`src/App.jsx` (linha 106) — o `placeholder` é um atributo do elemento
`<input>`:

```jsx
{/* antes */}
<input
  type="text"
  value={input}
  onChange={(event) => setInput(event.target.value)}
  onKeyDown={handleKeyDown}
  placeholder="Digite sua mensagem..."
/>

{/* depois */}
<input
  type="text"
  value={input}
  onChange={(event) => setInput(event.target.value)}
  onKeyDown={handleKeyDown}
  placeholder="Manda um Opa! 👋"
/>
```

`src/index.css` (linhas 72-85) — a cor do botão está na classe
`.input-bar button`, e o `:hover` logo abaixo é um tom mais escuro da mesma
cor (pra manter o padrão, gere o hover escurecendo ~15% a cor escolhida):

```css
/* antes */
.input-bar button {
  padding: 10px 18px;
  border: none;
  border-radius: 6px;
  background: #4a4ae0;
  color: #fff;
  font-size: 48px;
  font-weight: 600;
  cursor: pointer;
}

.input-bar button:hover {
  background: #3a3ac8;
}

/* depois (exemplo com verde) */
.input-bar button {
  padding: 10px 18px;
  border: none;
  border-radius: 6px;
  background: #1fa855;
  color: #fff;
  font-size: 48px;
  font-weight: 600;
  cursor: pointer;
}

.input-bar button:hover {
  background: #178a44;
}
```

**Checkpoint:** o campo de texto mostra o novo placeholder quando vazio, e o
botão "Enviar" está com a cor nova (normal e no hover).

---

## Tarefa 3 — Nickname e avatar (30 min)

**O que fazer:** hoje o app já tem os estados `nickname` e `hasJoined`
declarados em `src/App.jsx` (linhas 15-16), mas nada os usa ainda: não tem
tela pra digitar o nickname, e a mensagem enviada não carrega o nickname. É
isso que falta:

1. Enquanto `hasJoined` for `false`, mostrar uma tela simples pedindo o
   nickname em vez do chat.
2. Ao confirmar, guardar o nickname e virar `hasJoined = true`.
3. Incluir o nickname no payload da mensagem enviada.
4. Mostrar o nickname (com um avatar = inicial do nome) em cada mensagem
   recebida.

**Onde mexer:** `src/App.jsx`.

No `return` do componente (linha 78), condicionar o que é renderizado:

```jsx
// antes
return (
  <div className="app">
    <header className="app-header">Opa</header>
    {/* ... resto do chat ... */}
  </div>
)

// depois
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
    {/* ... resto do chat ... */}
  </div>
)
```

No `sendMessage` (linha 63), incluir o nickname no payload:

```js
// antes
const message = { text }

// depois
const message = { nickname, text }
```

No map de mensagens (linha 84-96), mostrar o avatar (inicial) e o nickname
antes do texto:

```jsx
{/* antes */}
<div key={index} className="message">
  <span className="message-text">{message.text}</span>
</div>

{/* depois */}
<div key={index} className="message">
  <span className="message-avatar">
    {message.nickname?.trim().charAt(0).toUpperCase()}
  </span>
  <span className="message-nickname">{message.nickname}:</span>{' '}
  <span className="message-text">{message.text}</span>
</div>
```

`src/index.css` (perto da regra `.message-nickname`, linha 50) — sem isso o
avatar fica sem estilo e a inicial "gruda" no nome (ex: nickname "gregory"
vira visualmente "Ggregory", parecendo letra duplicada):

```css
/* adicionar antes de .message-nickname */
.message-avatar {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  margin-right: 6px;
  border-radius: 50%;
  background: #ddd;
  color: #333;
  font-size: 12px;
  font-weight: 600;
}
```

**Checkpoint:** ao abrir o app, aparece a tela pedindo nickname antes do
chat; depois de entrar, cada mensagem mostra a inicial (avatar, num
círculo separado) e o nome de quem mandou — sem grudar um no outro.

---

## Tarefa 4 — Cor por usuário (30 min)

**O que fazer:** `src/utils/getNicknameColor.js` já existe com a
assinatura certa e um comentário explicando o algoritmo, mas hoje sempre
devolve `#333333` (stub). A tarefa é preencher o corpo da função pra gerar
uma cor determinística (mesmo nickname = mesma cor sempre) e usá-la no
nome exibido.

**Onde mexer:**

`src/utils/getNicknameColor.js` — substituir o corpo da função:

```js
// antes
export function getNicknameColor(nickname) {
  return '#333333'
}

// depois
export function getNicknameColor(nickname) {
  let hash = 0
  for (let i = 0; i < nickname.length; i++) {
    hash = nickname.charCodeAt(i) + ((hash << 5) - hash)
  }
  const hue = Math.abs(hash) % 360
  return `hsl(${hue}, 70%, 45%)`
}
```

`src/App.jsx` — já importa `getNicknameColor` (linha 5), só falta usar no
`style` do nome exibido, dentro do map de mensagens da Tarefa 3:

```jsx
{/* antes */}
<span className="message-nickname">{message.nickname}:</span>{' '}

{/* depois */}
<span
  className="message-nickname"
  style={{ color: getNicknameColor(message.nickname) }}
>
  {message.nickname}:
</span>{' '}
```

**Checkpoint:** cada nickname aparece sempre com a mesma cor, e nicknames
diferentes têm cores visualmente diferentes.

---

## Tarefa 5 — Notificação nativa (30 min)

**O que fazer:** a base já está funcionando — `electron/preload.js` expõe
`window.electronAPI.notify(title, body)`, `electron/main.js` escuta o canal
`'notify'` e mostra a notificação do sistema, e `src/App.jsx` já chama
`notify` quando chega mensagem de outra pessoa (linhas 36-38). A tarefa é
entender esse fluxo (é o exemplo mais direto de comunicação
renderer → preload → main) e melhorá-lo: só notificar quando a janela **não
estiver em foco** — hoje ele notifica sempre que a mensagem não é sua,
mesmo com a janela aberta na tela, o que fica repetitivo.

**Onde mexer:**

`electron/main.js` — expor pro preload se a janela está focada, escutando
um novo canal (perto do listener `'notify'`, linha 36):

```js
// adicionar, junto com o ipcMain.on('notify', ...) que já existe
ipcMain.handle('is-window-focused', () => {
  return mainWindow?.isFocused() ?? false
})
```

`electron/preload.js` — expor essa checagem pro renderer:

```js
// antes
contextBridge.exposeInMainWorld('electronAPI', {
  notify: (title, body) => {
    ipcRenderer.send('notify', title, body)
  },
})

// depois
contextBridge.exposeInMainWorld('electronAPI', {
  notify: (title, body) => {
    ipcRenderer.send('notify', title, body)
  },
  isWindowFocused: () => ipcRenderer.invoke('is-window-focused'),
})
```

`src/App.jsx` — usar a checagem antes de notificar (linhas 36-38). Antes de
editar, o callback do `socket.on('message', ...)` precisa virar `async`
(senão o `await` do passo seguinte dá erro de sintaxe):

```js
// antes
socket.on('message', (message) => {

// depois
socket.on('message', async (message) => {
```

Só então mexer no corpo do `if`:

```js
// antes
if (message.nickname !== nickname) {
  window.electronAPI?.notify(message.nickname, message.text)
}

// depois
if (message.nickname !== nickname) {
  const isFocused = await window.electronAPI?.isWindowFocused()
  if (!isFocused) {
    window.electronAPI?.notify(message.nickname, message.text)
  }
}
```

**Checkpoint:** com a janela em foco, mensagem de outra pessoa chega sem
notificação nativa; ao minimizar (ou trocar de janela) e pedir pra alguém
mandar mensagem, a notificação do sistema aparece.

---

## Tarefa 6 — Comando `/oi` (30 min)

**O que fazer:** `src/App.jsx` já tem o `canvas-confetti` instalado como
dependência (`package.json`) e um import comentado esperando por isso
(linha 9), mas o `sendMessage` ainda não checa nada — toda mensagem, mesmo
que comece com `/`, é enviada como texto normal. A tarefa é interceptar o
comando antes de emitir pro servidor.

**Onde mexer:** `src/App.jsx`.

Descomentar o import (linha 9):

```js
// antes
// import confetti from 'canvas-confetti'

// depois
import confetti from 'canvas-confetti'
```

No `sendMessage` (linha 50-70), checar o comando antes de montar a
mensagem normal:

```js
// antes
function sendMessage() {
  const text = input.trim()
  if (!text) return

  const message = { nickname, text }
  socketRef.current?.emit('message', message)
  setInput('')
}

// depois
function sendMessage() {
  const text = input.trim()
  if (!text) return

  if (text.startsWith('/oi')) {
    confetti()
    socketRef.current?.emit('message', {
      nickname,
      text: `${nickname} mandou um oi! 👋`,
    })
    setInput('')
    return
  }

  const message = { nickname, text }
  socketRef.current?.emit('message', message)
  setInput('')
}
```

**Checkpoint:** digitar `/oi` e enviar dispara confete na tela de quem
mandou, e todo mundo na sala vê a mensagem especial "fulano mandou um oi!
👋" chegando pelo chat normal.

**Se sobrar tempo:** deixe livre pra quem terminar criar o próprio comando
(`/tudobem`, `/tchau`, etc.), seguindo o mesmo padrão de `if
(text.startsWith(...))`.

---

## Tarefa 7 — Notificação personalizada com padrão Observer (45 min)

**O que fazer:** a Tarefa 5 já cobre a notificação nativa do sistema
operacional. Aqui a ideia é diferente: uma notificação **dentro do próprio
app** (som + um toast visual), organizada com o padrão Observer — em vez de
tocar som e mostrar toast direto no meio do listener do Socket.IO, criamos
um **subject** (`NotificationCenter`) que emite um evento "nova mensagem",
e cada reação (som, visual, o que mais quiser) é um **observer**
independente. Assim dá pra ligar/desligar cada um sem tocar nos outros.

Explique o padrão rapidamente: o Subject mantém uma lista de observers e um
método `notify(dado)` que chama todos; um Observer aqui é só uma função de
callback. Não precisa de biblioteca — dá pra fazer na mão com um array.

**Onde mexer:** criar `src/notifications/NotificationCenter.js` (arquivo
novo) e usar em `src/App.jsx`.

`src/notifications/NotificationCenter.js`:

```js
class NotificationCenter {
  #observers = []

  subscribe(observer) {
    this.#observers.push(observer)
    return () => {
      this.#observers = this.#observers.filter((o) => o !== observer)
    }
  }

  notify(event) {
    this.#observers.forEach((observer) => observer(event))
  }
}

export const notificationCenter = new NotificationCenter()
```

`src/App.jsx` — importar no topo (perto dos outros imports, linha 5):

```js
import { notificationCenter } from './notifications/NotificationCenter'
```

Registrar os observers uma vez, em um `useEffect` separado (pode ficar
logo depois do `useEffect` que abre a conexão do socket, linha 44):

```jsx
useEffect(() => {
  const unsubscribeSound = notificationCenter.subscribe(() => {
    new Audio('/sounds/ping.mp3').play().catch(() => {})
  })

  const unsubscribeToast = notificationCenter.subscribe(({ nickname: from, text }) => {
    setToast({ nickname: from, text })
    setTimeout(() => setToast(null), 3000)
  })

  return () => {
    unsubscribeSound()
    unsubscribeToast()
  }
}, [])
```

(Isso exige um novo estado `const [toast, setToast] = useState(null)` perto
dos outros `useState`, e um elemento simples no JSX pra exibir o
`toast` quando não for `null`, por exemplo logo antes do `.input-bar`:
`{toast && <div className="toast">{toast.nickname}: {toast.text}</div>}`.)

No listener de mensagem recebida (dentro do `socket.on('message', ...)` da
Tarefa 5, junto da notificação nativa), disparar o evento pro
`NotificationCenter`:

```js
if (message.nickname !== nickname) {
  notificationCenter.notify({ nickname: message.nickname, text: message.text })

  const isFocused = await window.electronAPI?.isWindowFocused()
  if (!isFocused) {
    window.electronAPI?.notify(message.nickname, message.text)
  }
}
```

**Checkpoint:** ao chegar mensagem nova de outra pessoa, o som toca e o
toast visual aparece juntos, vindos do mesmo evento — e dá pra desligar só
um dos dois comentando a linha do `subscribe` correspondente, sem mexer em
mais nada.

**Se sobrar tempo:** um terceiro observer que muda o título da aba/janela
enquanto há mensagem não lida, ou que só toca som se o usuário marcou uma
preferência salva no `localStorage`.

---

## Fechamento (15 min)

- Todo mundo conectado ao mesmo tempo, chat com nome "Opa", placeholder e
  botão customizados, nickname, avatar, cor, notificação nativa,
  notificação personalizada (som/visual via Observer) e comando `/oi`
  funcionando.
- Recap rápido: o que é main/preload/renderer, por que Electron != site
  comum, onde isso se conecta com apps "de verdade" (Discord, Slack, VS Code
  são todos Electron ou similares).
- Deixe o repo do projeto pronto disponível (GitHub) pra quem quiser
  continuar em casa.

---

## Dicas de logística

- Teste a rede do local **antes** — Wi-Fi de evento às vezes bloqueia
  conexão entre dispositivos na mesma rede (AP isolation). Tenha um plano B
  (hotspot do celular, ou todo mundo no mesmo cabo/switch).
- Tenha o `.env` com a URL do servidor já pronto pra copiar e colar, não
  peça pra digitarem IP na mão.
- Suba o servidor Socket.IO ANTES de todos abrirem o Electron, senão a
  primeira tentativa de conexão falha e gera pânico desnecessário.
