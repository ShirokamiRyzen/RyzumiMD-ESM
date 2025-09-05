import { areJidsSameUser } from '@whiskeysockets/baileys'
let handler = async (m, { conn, participants }) => {
    if(!m.mentionedJid) throw 'Tag User Yang ingin di promote'
    let users = m.mentionedJid.filter(u => !areJidsSameUser(u, conn.user.id))
    let user = m.mentionedJid && m.mentionedJid[0]
    conn.groupParticipantsUpdate(m.chat, [user], 'promote')
    .then(_ => m.reply('Succes'))

}
handler.help = ['promote @tag']
handler.tags = ['group']
handler.command = /^(promote)$/i
handler.admin = true
handler.group = true
handler.botAdmin = true

export default handler