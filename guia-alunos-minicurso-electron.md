# Minicurso Electron — Chat Local em Rede (3h)

## Visão geral

Os alunos recebem um chat funcional (conecta, manda e recebe mensagem) e
constroem 4 features em cima disso. Cada bloco é independente — se alguém
atrasar num, ainda consegue acompanhar o próximo.

**Pronto (entregue no início):**
- Janela Electron abrindo, processo main + preload configurados
- Conexão Socket.IO com o servidor (rodando na sua máquina)
- Lista de mensagens + campo de input funcionando (texto puro, sem nome/cor)
- `preload.ts` já expondo `window.electronAPI.notify(title, body)` (mas
  ninguém chama essa função ainda — isso é o Bloco 3)

**Eles constroem:**
1. Nickname + avatar
2. Cor por usuário
3. Notificação nativa
4. Comando `/oi`

---

## Bloco 0 — Abertura (15 min)

- Explique rapidamente: Electron = Chromium + Node.js rodando junto. Por isso
  dá pra ter notificação nativa, tray icon, acesso a arquivo — coisa que um
  site normal não faz.
- Mostre os 3 processos: **main** (`electron/main.ts`, controla a janela),
  **preload** (`electron/preload.ts`, ponte segura entre main e renderer),
  **renderer** (`src/App.tsx`, é o React normal que eles já conhecem).
- Rode o projeto pronto na tela, todo mundo conectado no mesmo servidor,
  mande uma mensagem pra provar que funciona.
- Passe o IP do servidor pro pessoal configurar no `.env` deles
  (`VITE_SERVER_URL=http://192.168.x.x:3000`).

## Bloco 1 — Nickname e avatar (30 min)

**Onde mexer:** `src/App.tsx` (ou componente `Login.tsx` se você separar)

- Antes de entrar no chat, pedir um nickname (input simples + botão "Entrar").
- Guardar no `useState`. Não precisa persistir — cada sessão pede de novo.
- Avatar: forma mais rápida pra 3h é gerar um emoji ou letra inicial com base
  no nickname (nada de upload de imagem, foge do tempo).

```tsx
const getInitial = (nickname: string) => nickname.trim().charAt(0).toUpperCase();
```

- Cada mensagem enviada ao servidor já deve carregar `{ nickname, text }` em
  vez de só `{ text }`.

**Checkpoint:** todo mundo consegue entrar com nome próprio e ver o nome do
colega nas mensagens que chegam.

## Bloco 2 — Cor por usuário (30 min)

**Onde mexer:** função utilitária nova, ex: `src/utils/color.ts`

- Gerar uma cor determinística a partir do nickname (mesmo nome = mesma cor
  sempre, sem precisar guardar em lugar nenhum).

```ts
export function nicknameToColor(nickname: string): string {
  let hash = 0;
  for (let i = 0; i < nickname.length; i++) {
    hash = nickname.charCodeAt(i) + ((hash << 5) - hash);
  }
  const hue = hash % 360;
  return `hsl(${hue}, 70%, 55%)`;
}
```

- Aplicar essa cor no nome exibido e/ou na borda do avatar.

**Checkpoint:** cada aluno tem uma cor visualmente diferente no chat.

## Bloco 3 — Notificação nativa (45 min)

**Onde mexer:** `electron/preload.ts` (já pronto) + `src/App.tsx` (chamar)

- Explique o porquê do preload existir: o renderer (React) não pode acessar
  APIs do sistema diretamente por segurança. O preload expõe só o que é
  necessário via `contextBridge`.
- Mostrar o que já está pronto em `preload.ts`:

```ts
contextBridge.exposeInMainWorld('electronAPI', {
  notify: (title: string, body: string) => ipcRenderer.send('notify', title, body),
});
```

- E no `main.ts` (também já pronto), o listener que efetivamente cria a
  notificação:

```ts
ipcMain.on('notify', (_event, title: string, body: string) => {
  new Notification({ title, body }).show();
});
```

- **O exercício deles**: no `App.tsx`, dentro do listener de mensagem
  recebida do Socket.IO, chamar `window.electronAPI.notify(nickname, text)` —
  mas só se a mensagem não for do próprio usuário, e (bônus) só se a janela
  não estiver em foco.

**Checkpoint:** minimizar a janela, pedir pra um colega mandar mensagem,
notificação aparece no canto da tela.

## Bloco 4 — Comando `/oi` divertido (45 min)

**Onde mexer:** `src/App.tsx`, na função que trata o envio de mensagem

- Antes de enviar a mensagem pro servidor, checar se o texto começa com `/`.
- Se for um comando reconhecido, disparar algo visual em vez de mandar texto
  puro — sugestões rápidas de implementar em 45 min:
  - `/oi` → dispara confete na tela (lib `canvas-confetti`, já dá pra
    `npm install` na hora)
  - `/oi` → manda uma mensagem especial com estilo diferente (fundo colorido,
    ícone, fonte maior) que todo mundo vê
  - Deixe livre: se algum aluno terminar antes, sugira criar o próprio
    comando (`/tudobem`, `/tchau`, etc.)

```tsx
if (text.startsWith('/oi')) {
  confetti();
  socket.emit('message', { nickname, text: `${nickname} mandou um oi! 👋`, type: 'command' });
  return;
}
```

**Checkpoint:** comando funciona e todo mundo na sala vê o efeito.

## Bloco 5 — Fechamento (15 min)

- Todo mundo conectado ao mesmo tempo, chat cheio de nome, cor, notificação e
  comando funcionando.
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
