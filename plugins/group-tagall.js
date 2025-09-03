let handler = async (m, { conn, text, participants }) => {
    const fallbackText = (
        m.quoted?.text ||
        m.quoted?.caption ||
        m.quoted?.message?.extendedTextMessage?.text ||
        m.quoted?.message?.conversation ||
        ''
    ).trim()
    const msgText = (text || '').trim() || fallbackText

    const users = participants.map(u => u.id).filter(v => v !== conn.user.jid)
    const body = users.map(v => '│◦❒ @' + v.replace(/@.+/, '')).join('\n')
    const content = `${msgText ? `${msgText}\n\n` : ''}${body}`.trim()

    await conn.reply(
        m.chat,
        content,
        m,
        { contextInfo: { mentionedJid: users } }
    )
}

handler.help = ['tagall']
handler.tags = ['group']
handler.command = /^(tagall)$/i
handler.admin = handler.group = true

export default handler
