// TODO COR: implemente uma função que gere sempre a MESMA cor para o
// mesmo nickname (uma cor "determinística").
//
// Sugestão de algoritmo:
//   1. Percorra os caracteres da string `nickname` e vá acumulando um
//      número (hash) a partir do código de cada caractere, ex:
//        let hash = 0
//        for (let i = 0; i < nickname.length; i++) {
//          hash = nickname.charCodeAt(i) + ((hash << 5) - hash)
//        }
//   2. Reduza o hash a um valor entre 0 e 360 (matiz/hue de HSL):
//        const hue = Math.abs(hash) % 360
//   3. Monte uma cor em HSL usando saturação/luz fixas para manter
//      contraste legível, ex:
//        return `hsl(${hue}, 70%, 45%)`
//   4. Use essa cor no `style={{ color: ... }}` do nome exibido em cada
//      mensagem (ver App.jsx, no map de mensagens).
export function getNicknameColor(nickname) {
  return '#333333'
}
