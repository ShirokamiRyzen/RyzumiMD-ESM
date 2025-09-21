import axios from 'axios'

const handler = async (m, { conn, args }) => {
    if (args.length < 2 && !(m.quoted && m.quoted.text)) {
        throw `Gunakan format: .fakestory <username>|<caption>\n\nContoh:\n.fakestory Ryzumi|Hello World ✨✨✨`
    }

    let [username, caption] = args.join(" ").split("|")
    if (!caption && m.quoted && m.quoted.text) {
        caption = m.quoted.text
    }
    if (!username) username = await conn.getName(m.sender)

    const pp = await conn.profilePictureUrl(m.sender, 'image').catch(_ => './src/avatar_contact.png')

    const url = `${APIs.ryzumi}/api/image/fake-story?` +
        `username=${encodeURIComponent(username.trim())}` +
        `&caption=${encodeURIComponent(caption.trim())}` +
        `&avatar=${encodeURIComponent(pp)}`

    const response = await axios.get(url, { responseType: 'arraybuffer' })
    const buffer = Buffer.from(response.data)

    await conn.sendFile(m.chat, buffer, 'fake_story.png', '', m)
}

handler.help = ['fakestory']
handler.tags = ['maker']
handler.command = /^(fakestory)$/i

handler.register = true

export default handler
