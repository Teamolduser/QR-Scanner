const makeWASocket = require("@whiskeysockets/baileys").default
const qrcode = require("qrcode-terminal")
const fs = require('fs')
const pino = require('pino')
const { delay , useMultiFileAuthState,BufferJSON, fetchLatestBaileysVersion } = require("@whiskeysockets/baileys")

const useStore = !process.argv.includes('--no-store')
const doReplies = !process.argv.includes('--no-reply')
const usePairingCode = process.argv.includes('--use-pairing-code')
const useMobile = process.argv.includes('--mobile')


  async function qr() {
//------------------------------------------------------
let { version, isLatest } = await fetchLatestBaileysVersion()
const {  state, saveCreds } =await useMultiFileAuthState(`./session`)
    const session = makeWASocket({
        logger: pino({ level: 'silent' }),
        printQRInTerminal: !usePairingCode,
	    	mobile: useMobile,
        browser: ['Alien-Alfa','opera','1.0.0'],
        auth: state,
        version
    })

    if(usePairingCode) {
		if(useMobile) {
			throw new Error('Cannot use pairing code with mobile api')
		}

		const phoneNumber = '+918602239106'
		const code = await session.requestPairingCode(phoneNumber)
		console.log(`Pairing code: ${code}`)
    }
//------------------------------------------------------
    session.ev.on("connection.update",async  (s) => {
        const { connection, lastDisconnect } = s
        if (connection == "open") {
            await delay(1000 * 10)
            process.exit(0)
        }
        if (
            connection === "close" &&
            lastDisconnect &&
            lastDisconnect.error &&
            lastDisconnect.error.output.statusCode != 401
        ) {
            qr()
        }
    })
    session.ev.on('creds.update', saveCreds)
    session.ev.on("messages.upsert",  () => { })
}
qr()
