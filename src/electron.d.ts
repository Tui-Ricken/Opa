export {}

declare global {
  interface Window {
    electronAPI: {
      notify: (title: string, body: string) => void
    }
  }
}
