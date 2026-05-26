import * as net from 'net'

export function checkServerOnline(host: string, port: number): Promise<boolean> {
  return new Promise((resolve) => {
    const timer = setTimeout(() => { socket.destroy(); resolve(false) }, 2000)
    const socket = net.createConnection({ host, port })
      .on('connect', () => { clearTimeout(timer); socket.destroy(); resolve(true) })
      .on('error', () => { clearTimeout(timer); resolve(false) })
  })
}
