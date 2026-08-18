# Chat LAN — Electron + React + TypeScript + Vite + Socket.IO

Projeto-base para minicurso de Electron (3h). Uma parte já está pronta e
funcionando; os alunos implementam 4 features marcadas com `TODO` no código.

## Estrutura

- `/server` — servidor Node.js + Express + Socket.IO. Escuta na porta 3000
  e faz broadcast de qualquer mensagem recebida no evento `message` para
  todos os clientes conectados. Tudo em memória, sem banco de dados.
- `/electron` — `main.ts` (cria a `BrowserWindow` e a notificação nativa)
  e `preload.ts` (expõe `window.electronAPI` via `contextBridge`).
- `/src` — app React (Vite), componente principal em `App.tsx`.

## Como rodar

### 1. Servidor

```bash
cd server
npm install
npm start
```

O servidor sobe em `http://localhost:3000`.

### 2. App Electron (em outro terminal, na raiz do projeto)

```bash
npm install
cp .env.example .env
npm run dev
```

Isso abre a janela do Electron já carregando o app React em modo dev
(hot reload) e conectando no servidor Socket.IO.

### 3. Configurando o `.env` para rodar em rede

Por padrão, `.env.example` aponta para `http://localhost:3000` (servidor e
app na mesma máquina). Para os alunos conectarem de outros computadores na
mesma rede local ao servidor de uma máquina "host":

1. Na máquina que vai rodar o `/server`, descubra o IP local (ex:
   `ip addr` no Linux, `ipconfig` no Windows — algo como `192.168.0.10`).
2. Em cada máquina que vai rodar o app Electron, edite o `.env` (copiado do
   `.env.example`) e troque:
   ```
   VITE_SERVER_URL=http://192.168.0.10:3000
   ```
3. Garanta que o firewall da máquina host libera a porta 3000.

## Os 4 TODOs (gabarito para o professor)

1. **TODO NICKNAME** — tela/estado de nickname antes de entrar no chat, e
   troca do payload de mensagem de `{ text }` para `{ nickname, text }`.
   - [src/App.tsx](src/App.tsx) — comentários logo no início do componente
     `App` e no `sendMessage` (~linhas 16 e 62).
   - [src/types.ts](src/types.ts) — ajustar a interface `ChatMessage`.

2. **TODO COR** — função que gera uma cor determinística (hash simples do
   nickname → HSL) e aplica no nome exibido de cada mensagem.
   - [src/utils/getNicknameColor.ts](src/utils/getNicknameColor.ts) —
     função stub com o algoritmo sugerido em comentário.
   - [src/App.tsx](src/App.tsx) — uso no render da lista de mensagens
     (~linha 88).

3. **TODO NOTIFICACAO** — no listener de mensagem recebida do socket,
   chamar `window.electronAPI.notify(nickname, text)` quando a mensagem
   não for do próprio usuário.
   - [src/App.tsx](src/App.tsx) — dentro do `socket.on('message', ...)`
     (~linha 33).
   - A notificação nativa já está implementada e pronta em
     [electron/main.ts](electron/main.ts) (`ipcMain.on('notify', ...)`) e
     exposta em [electron/preload.ts](electron/preload.ts)
     (`window.electronAPI.notify`) — só falta chamá-la no renderer.

4. **TODO COMANDO** — antes de emitir a mensagem para o servidor, checar
   se o texto começa com `/oi` e disparar `confetti()`.
   - [src/App.tsx](src/App.tsx) — dentro do `sendMessage`, antes do
     `socket.emit` (~linha 55).
   - `canvas-confetti` já está instalado como dependência; o import
     comentado está no topo do [src/App.tsx](src/App.tsx).

## Stack

- Electron + `vite-plugin-electron` (build do main/preload junto com o Vite)
- React + TypeScript + Vite
- Socket.IO (cliente e servidor)
- CSS puro
