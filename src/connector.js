const util = require('util')
const open = require('open')
const path = require('path')
const findRoot = require('find-root')
const HttpServer = require('tiny-server')
const socket = require('socket.io')
const debug = require('debug')('botium-connector-webspeech')

const Capabilities = {
  WEBSPEECH_SERVER_PORT: 'WEBSPEECH_SERVER_PORT',
  WEBSPEECH_LANGUAGE: 'WEBSPEECH_LANGUAGE',
  WEBSPEECH_PITCH: 'WEBSPEECH_PITCH',
  WEBSPEECH_RATE: 'WEBSPEECH_RATE',
  WEBSPEECH_VOLUME: 'WEBSPEECH_VOLUME',
  WEBSPEECH_VOICE: 'WEBSPEECH_VOICE',
  WEBSPEECH_CLOSEBROWSER: 'WEBSPEECH_CLOSEBROWSER',
  WEBSPEECH_BROWSER_APP: 'WEBSPEECH_BROWSER_APP'
}

const Defaults = {
  [Capabilities.WEBSPEECH_SERVER_PORT]: 46050,
  [Capabilities.WEBSPEECH_LANGUAGE]: 'en-US',
  [Capabilities.WEBSPEECH_CLOSEBROWSER]: true,
  [Capabilities.WEBSPEECH_BROWSER_APP]: 'chrome'
}

const promisify = (fnc, ...args) => {
  return new Promise((resolve, reject) => {
    try {
      fnc(...args, (err, result) => {
        if (err) reject(err)
        else resolve(result)
      })
    } catch (err) {
      reject(err)
    }
  })
}

class BotiumConnectorWebspeech {
  constructor ({ queueBotSays, caps }) {
    this.queueBotSays = queueBotSays
    this.caps = Object.assign({}, Defaults, caps)

    this.connectorPackageRootDir = null
    this.browserConfig = null
    this.httpServer = null
    this.io = null
    this.clientSocket = null
    this.usersaidResolve = null
    this.connectResolve = null
    this.clientProcess = null
  }

  Validate () {
    if (!this.caps[Capabilities.WEBSPEECH_SERVER_PORT]) throw new Error('WEBSPEECH_SERVER_PORT capability required')
    if (!this.caps[Capabilities.WEBSPEECH_LANGUAGE]) throw new Error('WEBSPEECH_LANGUAGE capability required')
  }

  Build () {
    this.connectorPackageRootDir = findRoot()

    this.browserConfig = {
      WEBSPEECH_LANGUAGE: this.caps[Capabilities.WEBSPEECH_LANGUAGE],
      WEBSPEECH_PITCH: this.caps[Capabilities.WEBSPEECH_PITCH],
      WEBSPEECH_RATE: this.caps[Capabilities.WEBSPEECH_RATE],
      WEBSPEECH_VOLUME: this.caps[Capabilities.WEBSPEECH_VOLUME],
      WEBSPEECH_VOICE: this.caps[Capabilities.WEBSPEECH_VOICE]
    }
    console.log(path.resolve(this.connectorPackageRootDir, 'src', 'webspeech'))
    this.httpServer = new HttpServer(path.resolve(this.connectorPackageRootDir, 'src', 'webspeech'))
    this.io = socket(this.httpServer)
    this.io.on('connection', (clientSocket) => {
      debug('browser connected to socket')
      this.clientSocket = clientSocket
      this.clientSocket.on('disconnect', () => {
        debug('browser disconnecteded from socket')
        this.clientSocket = null
      })
      this.clientSocket.on('log', (msg) => {
        debug(`browser log: ${msg}`)
      })
      this.clientSocket.on('botsays', (msg) => {
        debug(`browser botsays: ${msg}`)
        if (msg) {
          const botMsg = { sender: 'bot', messageText: msg }
          this.queueBotSays(botMsg)
        }
      })
      this.clientSocket.on('usersaid', (msg) => {
        if (this.usersaidResolve) {
          this.usersaidResolve()
          this.usersaidResolve = null
        }
      })
      this.clientSocket.emit('startrecognize', this.browserConfig)

      if (this.connectResolve) {
        this.connectResolve()
        this.connectResolve = null
      }
    })

    return new Promise((resolve, reject) => {
      this.httpServer.listen(this.caps[Capabilities.WEBSPEECH_SERVER_PORT])
        .once('listening', () => {
          debug(`Listening for browser connection on port ${this.caps[Capabilities.WEBSPEECH_SERVER_PORT]}`)
          resolve()
        })
        .once('error', (err) => {
          if (err.code === 'EADDRINUSE') {
            debug(`Port ${this.caps[Capabilities.WEBSPEECH_SERVER_PORT]} already in use.`)
            reject(new Error(`Port ${this.caps[Capabilities.WEBSPEECH_SERVER_PORT]} already in use.`))
          } else {
            debug(`Server error: ${err.message || util.inspect(err)}`)
          }
        })
    })
  }

  Start () {
    if (!this.clientSocket) {
      return new Promise((resolve, reject) => {
        this.connectResolve = () => {
          resolve()
        }

        const openOptions = { }
        if (this.caps[Capabilities.WEBSPEECH_BROWSER_APP]) {
          openOptions.app = this.caps[Capabilities.WEBSPEECH_BROWSER_APP]
        }

        const browserUrl = `http://127.0.0.1:${this.caps[Capabilities.WEBSPEECH_SERVER_PORT]}/WebSpeechContainer.html`
        debug(`opening browser process to point to url ${browserUrl}`)
        open(browserUrl, openOptions).then((cp) => {
          debug('browser process running')
          this.clientProcess = cp
        })
      })
    }
  }

  UserSays (msg) {
    debug(`UserSays called: ${msg.messageText}`)
    return new Promise((resolve, reject) => {
      if (this.clientSocket) {
        this.usersaidResolve = () => {
          resolve()
        }
        this.clientSocket.emit('usersays', this.browserConfig, msg)
      } else {
        reject(new Error('browser connection not online'))
      }
    })
  }

  Stop () {
  }

  async Clean () {
    this.connectorPackageRootDir = null
    this.browserConfig = null
    this.io = null
    if (this.clientSocket) {
      if (this.caps[Capabilities.WEBSPEECH_CLOSEBROWSER]) {
        this.clientSocket.emit('close')
      }
      this.clientSocket.disconnect(true)
      this.clientSocket = null
    }
    if (this.httpServer) {
      debug('closing http server')
      await promisify(this.httpServer.close.bind(this.httpServer))
      debug('stopped browser listening.')
      this.httpServer = null
    }
    if (this.clientProcess && this.caps[Capabilities.WEBSPEECH_CLOSEBROWSER]) {
      debug('killing browser process')
      this.clientProcess.kill()
    }
    this.clientProcess = null
    this.usersaidResolve = null
    this.connectResolve = null
  }
}

module.exports = BotiumConnectorWebspeech
