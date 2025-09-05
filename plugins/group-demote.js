import { areJidsSameUser } from '@whiskeysockets/baileys'
let handler = async (m, { conn, participants }) => {
    if(!m.mentionedJid) throw 'Tag User Yang ingin di demote'
    let users = m.mentionedJid.filter(u => !areJidsSameUser(u, conn.user.id))
    let user = m.mentionedJid && m.mentionedJid[0]
    conn.groupParticipantsUpdate(m.chat, [user], 'demote')
    .then(_ => m.reply('Succes'))

}
handler.help = ['demote @tag']
handler.tags = ['group']
handler.command = /^(demote)$/i
handler.admin = true
handler.group = true
handler.botAdmin = true

export default handler