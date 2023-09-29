import 'dotenv/config'
import fs from 'fs'

import { NodeSSH } from 'node-ssh'

async function main() {
  const ssh = new NodeSSH()

  await ssh.connect({
    port: 22,
    host: process.env.SERVER_IP,
    username: process.env.SERVER_USERNAME,
    privateKeyPath: process.env.CERT_PATH,
  })

  // ssh.connection?.on('error', (err) => {
  //   console.log('error event on connection', err)
  // })

  console.log(await ssh.execCommand('echo hi'))
  console.log(await ssh.execCommand('sudo reboot'))
}

main()
  .then(() => {
    console.log('no uncaught errors - exiting')
    process.exit(0)
  })
  .catch(err => {
    console.error('uncaught error: ', err)
    process.exit(1)
  })

process.on('unhandledRejection', (reason, promise) => {
  console.log('dying on unhandledRejection', reason, promise)
  process.exit(1)
})

process.on('uncaughtException', (err, origin) => {
  fs.writeSync(process.stderr.fd, `Caught exception: ${err}\nException origin: ${origin}`)
  process.exit(1)
})
