import { areJidsSameUser } from '@whiskeysockets/baileys'

let handler = async (m, { conn, text, usedPrefix, command }) => {
    // 1) Resolve target JID (prefer manual number in group too)
    let rawTarget
    if (m.isGroup) {
        const tokens = (text || '').trim().split(/\s+/).filter(Boolean)
        const first = tokens[0]
        if (first && /\d{5,}/.test(first)) {
            rawTarget = first.replace(/[^0-9]/g, '') + '@s.whatsapp.net'
        } else {
            rawTarget = m.mentionedJid?.[0] ? m.mentionedJid[0] : (m.quoted ? m.quoted.sender : null)
        }
    } else if (text) {
        const num = text.replace(/[^0-9]/g, '')
        if (num) rawTarget = num + '@s.whatsapp.net'
    }

    if (!rawTarget) throw `Provide target user.\n\nExample:\n• ${usedPrefix + command} @user\n• ${usedPrefix + command} 6281234567890`

    // Normalize
    const decoded = typeof conn.decodeJid === 'function' ? conn.decodeJid(rawTarget) : rawTarget
    let jid = typeof conn.getJid === 'function' ? conn.getJid(decoded) : decoded

    // Resolve via participants in group if needed
    if (m.isGroup && (!/@s\.whatsapp\.net$/.test(jid))) {
        try {
            const meta = (conn.chats?.[m.chat]?.metadata) || (await conn.groupMetadata?.(m.chat))
            const parts = meta?.participants || []
            const raws = parts.flatMap(p => [p?.id, p?.jid, p?.participant, p?.lid]).filter(Boolean).map(String)
            const matches = raws.map(raw => {
                const norm = typeof conn.getJid === 'function' ? conn.getJid(raw) : (raw.decodeJid ? raw.decodeJid() : raw)
                return { raw, norm, ok: areJidsSameUser(norm, jid) }
            }).filter(x => x.ok)
            const pick = matches.find(x => /@s\.whatsapp\.net$/.test(x.raw)) || matches.find(x => /@s\.whatsapp\.net$/.test(x.norm)) || matches[0]
            if (pick) jid = /@s\.whatsapp\.net$/.test(pick.raw) ? pick.raw : pick.norm
        } catch {}
    }

    // 2) Locate user in DB using phone-based key only
    const dbRoot = (global.db && global.db.data) ? global.db.data : (global.db = { ...(global.db || {}), data: {} }).data
    if (!dbRoot.users) dbRoot.users = {}
    const users = dbRoot.users

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

    if (!dbKey || !users[dbKey]) throw 'User not found.'

    users[dbKey].premium = false
    users[dbKey].premiumTime = 0
    conn.reply(m.chat, 'Done!', m)
}

handler.help = ['delprem']
handler.tags = ['owner']
handler.command = /^delprem(user)?$/i
handler.rowner = true

export default handler