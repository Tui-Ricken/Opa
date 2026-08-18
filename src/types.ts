// Formato da mensagem trocada entre cliente e servidor.
//
// TODO NICKNAME: quando implementar a tela de nickname, troque este tipo
// para incluir o nome de quem enviou, ex:
//   export interface ChatMessage {
//     nickname: string
//     text: string
//   }
export interface ChatMessage {
  text: string
}
