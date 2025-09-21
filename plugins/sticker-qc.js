import axios from 'axios'

const handler = async (m, { conn, args }) => {
    let text
    if (args.length >= 1) {
        text = args.join(" ")
    } else if (m.quoted && m.quoted.text) {
        text = m.quoted.text
    } else throw "Mana teksnya?"

    const who = m.mentionedJid && m.mentionedJid[0]
        ? m.mentionedJid[0]
        : m.fromMe
            ? conn.user.jid
            : m.sender

    const orang = text
    const pp = await conn.profilePictureUrl(who, 'image').catch(_ => './src/avatar_contact.png')
    const name = await conn.getName(who)

    const url = `${APIs.ryzumi}/api/image/quotly?` +
        `text=${encodeURIComponent(orang)}` +
        `&name=${encodeURIComponent(name)}` +
        `&avatar=${encodeURIComponent(pp)}`

    const response = await axios.get(url, { responseType: 'arraybuffer' })
    const buffer = Buffer.from(response.data)

    conn.sendSticker(m.chat, buffer, m)
}

handler.help = ['qc']
handler.tags = ['maker']
handler.command = /^(qc)$/i

handler.register = true

export default handler
