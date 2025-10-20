import { areJidsSameUser } from '@whiskeysockets/baileys'

let handler = async (m, { conn, text, usedPrefix, command }) => {
    // 1) Resolve target JID (prefer manual number, then mention/reply)
    let rawTarget
    if (m.isGroup) {
        const tokens = (text || '').trim().split(/\s+/).filter(Boolean)
        // support formats: 
        //  - .addprem 628xxxx 7
        //  - .addprem @mention 7
        //  - reply + .addprem 7
        const first = tokens[0]
        if (first && /\d{5,}/.test(first)) {
            rawTarget = first.replace(/[^0-9]/g, '') + '@s.whatsapp.net'
        } else {
            rawTarget = m.mentionedJid?.[0] ? m.mentionedJid[0] : (m.quoted ? m.quoted.sender : null)
        }
    } else {
        const [numCandidate] = (text || '').trim().split(/\s+/)
        if (numCandidate) rawTarget = numCandidate.replace(/[^0-9]/g, '') + '@s.whatsapp.net'
    }

    if (!rawTarget) throw `Tag/Reply target user or provide a number.\n\nExample:\n• ${usedPrefix + command} @user 7\n• ${usedPrefix + command} 6281234567890 7`

    // Normalize with built-in helpers to avoid LID keys where possible
    const decoded = typeof conn.decodeJid === 'function' ? conn.decodeJid(rawTarget) : rawTarget
    let jid = typeof conn.getJid === 'function' ? conn.getJid(decoded) : decoded

    // If still not a phone-based JID, try resolve via current group's participants
    if (m.isGroup && (!/@s\.whatsapp\.net$/.test(jid))) {
        try {
            const meta = (conn.chats?.[m.chat]?.metadata) || (await conn.groupMetadata?.(m.chat))
            const parts = meta?.participants || []
            const candidate = parts
                .map(p => p?.id || p?.jid || p?.participant || p?.lid)
                .filter(Boolean)
                .map(x => String(x))
                .find(x => areJidsSameUser((typeof conn.getJid === 'function' ? conn.getJid(x) : x.decodeJid ? x.decodeJid() : x), jid))
            if (candidate && /@s\.whatsapp\.net$/.test(candidate)) {
                jid = candidate
            }
        } catch {}
    }

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

    // 3) Ensure user record exists under a phone-based JID (not LID)
    const users = global.db?.data?.users || {}

    // Determine the proper DB key:
    // - Prefer normalized phone JID (xxx@s.whatsapp.net)
    // - If target is LID or unknown format, find an existing phone JID in DB that represents the same user (areJidsSameUser)
    let dbKey = null
    if (typeof jid === 'string' && /@s\.whatsapp\.net$/.test(jid)) {
        dbKey = jid
    } else {
        const keys = Object.keys(users)
        const found = keys.find(k => {
            if (!/@s\.whatsapp\.net$/.test(k)) return false
            const kNorm = typeof conn.getJid === 'function' ? conn.getJid(k) : (k.decodeJid ? k.decodeJid() : k)
            return areJidsSameUser(kNorm, jid)
        })
        if (found) dbKey = found
    }

    if (!dbKey) throw `User not found in database.`

    let userData = users[dbKey]
    const now = Date.now()
    const addMs = 86400000 * days

    if (userData.role === 'Free user') userData.role = 'Premium user'
    if (now < (userData.premiumTime || 0)) userData.premiumTime += addMs
    else userData.premiumTime = now + addMs
    userData.premium = true

    const countdown = userData.premiumTime - now
    const displayJid = dbKey
    m.reply(`✔️ Success
📛 Name: ${userData.name || (await conn.getName?.(displayJid)) || displayJid.split('@')[0]}
📆 Days: ${days} day(s)
⏳ Countdown: ${countdown}`)
}

handler.help = ['addprem <phone number> <days>']
handler.tags = ['owner']
handler.command = /^addprem?$/i

handler.rowner = true

export default handler
