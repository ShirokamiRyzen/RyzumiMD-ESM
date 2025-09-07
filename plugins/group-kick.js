var handler = async (m, { conn, text, participants }) => {
    let who = m.quoted ? m.quoted.sender : m.mentionedJid && m.mentionedJid[0] ? m.mentionedJid[0] : text ? (text.replace(/\D/g, '') + '@s.whatsapp.net') : ''
    if (!who || who == m.sender) throw 'Reply / tag yang ingin di kick'
    if (participants.filter(v => v.jid == who).length == 0) throw `Target tidak berada dalam Grup !`
    conn.groupParticipantsUpdate(m.chat, [who], 'remove')
        .then(_ => m.reply(`Success`))
}

handler.help = ['kick'].map(v => v + ' @user')
handler.tags = ['group']
handler.command = /^(kick)$/i

handler.owner = false
handler.group = true
handler.botAdmin = true
handler.admin = true

export default handler