import open from 'open'
import { isPortTaken } from '../../util'

export async function openClient(ctx, clientPort) {
  // Check until the client is served
  const checkClientReady = () => {
    setTimeout(async () => {
      const portTaken = await isPortTaken(clientPort)
      if (portTaken) {
        open(
          `http://localhost:${clientPort}/#/${
            ctx.daoAddress ? ctx.daoAddress : ''
          }`
        )
      } else {
        checkClientReady()
      }
    }, 250)
  }
  checkClientReady()
}
