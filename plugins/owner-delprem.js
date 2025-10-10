let handler = async (m, { conn, text }) => {
    if (!text && !m.mentionedJid?.length && !m.quoted) throw 'Provide target user. Example: .delprem @user or .delprem 6281234567890'
    let rawTarget
    if (m.isGroup) {
        rawTarget = m.mentionedJid?.[0] ? m.mentionedJid[0] : (m.quoted ? m.quoted.sender : null)
    } else if (text) {
        const num = text.replace(/[^0-9]/g, '')
        if (!num) throw 'Invalid number.'
        rawTarget = num + '@s.whatsapp.net'
    }

    // Normalize to phone-based JID (avoid LID)
    const decoded = typeof conn.decodeJid === 'function' ? conn.decodeJid(rawTarget) : rawTarget
    const jid = typeof conn.getJid === 'function' ? conn.getJid(decoded) : decoded

    let users = global.db.data.users
    // migrate data from rawTarget if needed
    if (!users[jid] && users[rawTarget]) users[jid] = users[rawTarget]
    if (users[jid]) {
        users[jid].premium = false
        users[jid].premiumTime = 0
        conn.reply(m.chat, 'Done!', m)
    } else {
        throw 'User not found.'
    }
}

handler.help = ['delprem']
handler.tags = ['owner']
handler.command = /^delprem(user)?$/i
handler.rowner = true

export default handler