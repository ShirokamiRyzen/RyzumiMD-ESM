import axios from 'axios'

const handler = async (m, { conn, args }) => {
    let text
    if (args.length >= 1) {
        text = args.join(" ")
    } else if (m.quoted && m.quoted.text) {
        text = m.quoted.text
    } else throw "Mana teksnya?"

    // URL encode biar aman dipakai di query
    const url = `${APIs.ryzumi}/api/image/iqc?text=${encodeURIComponent(text)}`

    const response = await axios.get(url, { responseType: 'arraybuffer' })
    const buffer = Buffer.from(response.data)

    // kirim sebagai file (image/png)
    await conn.sendFile(m.chat, buffer, 'iqc.png', '', m)
}

handler.help = ['iqc']
handler.tags = ['maker']
handler.command = /^(iqc)$/i

handler.register = true

export default handler
