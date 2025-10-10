let handler = async (m, { conn, text, usedPrefix, command }) => {
    // 1) Resolve target JID (normalize to phone-based JID, not LID)
    let rawTarget
    if (m.isGroup) {
        rawTarget = m.mentionedJid?.[0] ? m.mentionedJid[0] : (m.quoted ? m.quoted.sender : null)
    } else {
        const [numCandidate] = (text || '').trim().split(/\s+/)
        if (numCandidate) rawTarget = numCandidate.replace(/[^0-9]/g, '') + '@s.whatsapp.net'
    }

    if (!rawTarget) throw `Tag/Reply target user or provide a number.\n\nExample:\n• ${usedPrefix + command} @user 7\n• ${usedPrefix + command} 6281234567890 7`

    // Normalize with built-in helpers to avoid LID keys
    const decoded = typeof conn.decodeJid === 'function' ? conn.decodeJid(rawTarget) : rawTarget
    const jid = typeof conn.getJid === 'function' ? conn.getJid(decoded) : decoded

    // 2) Parse duration (days)
    let daysStr
    if (m.isGroup) {
        // for ".addprem @mention 7" assume last token is days
        const tokens = (text || '').trim().split(/\s+/).filter(Boolean)
        daysStr = tokens.length ? tokens[tokens.length - 1] : undefined
    } else {
        const [, d] = (text || '').trim().split(/\s+/)
        daysStr = d
    }
    const days = parseInt(daysStr, 10)
    if (!days || isNaN(days) || days <= 0) throw `Invalid days.\n\nExample:\n• ${usedPrefix + command} @user 7\n• ${usedPrefix + command} 6281234567890 30`

    // 3) Ensure user record exists under the normalized JID.
    const users = global.db?.data?.users || {}
    // Migrate data if it's stored under a LID or another variant
    if (!users[jid] && users[rawTarget]) users[jid] = users[rawTarget]
    if (!users[jid]) throw `User not found in database.`

    let userData = users[jid]
    const now = Date.now()
    const addMs = 86400000 * days

    if (userData.role === 'Free user') userData.role = 'Premium user'
    if (now < (userData.premiumTime || 0)) userData.premiumTime += addMs
    else userData.premiumTime = now + addMs
    userData.premium = true

    const countdown = userData.premiumTime - now
    m.reply(`✔️ Success
📛 Name: ${userData.name || (await conn.getName?.(jid)) || jid.split('@')[0]}
📆 Days: ${days} day(s)
⏳ Countdown: ${countdown}`)
}

handler.help = ['addprem <phone number> <days>']
handler.tags = ['owner']
handler.command = /^addprem?$/i

handler.rowner = true

export default handler
