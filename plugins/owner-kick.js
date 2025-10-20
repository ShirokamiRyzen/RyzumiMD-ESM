import { areJidsSameUser } from '@whiskeysockets/baileys'

var handler = async (m, { conn, participants, botAdmin, text }) => {
  if (!botAdmin) {
    return m.reply('Bot Bukan Admin T-T')
  }
  // Resolve target from reply/mention/number
  const rawWho = m.quoted?.sender || (m.mentionedJid && m.mentionedJid[0]) || (text ? (text.replace(/\D/g, '') + '@s.whatsapp.net') : '')
  if (!rawWho) throw 'Reply / tag yang ingin di kick'

  // Normalize JID (handle device part and @lid mapping if available)
  const who = typeof conn.getJid === 'function' ? conn.getJid(rawWho) : (rawWho.decodeJid ? rawWho.decodeJid() : rawWho)

  if (areJidsSameUser(who, m.sender)) throw 'Reply / tag yang ingin di kick'

  // Normalize participant JIDs and check membership robustly
  const parts = participants
    .map(p => p?.id || p?.jid || p?.participant || p?.lid)
    .filter(Boolean)
    .map(raw => ({ raw, norm: (typeof conn.getJid === 'function' ? conn.getJid(raw) : (raw.decodeJid ? raw.decodeJid() : raw)) }))

  const matched = parts.find(p => areJidsSameUser(p.norm, who))
  if (!matched) throw 'Target tidak berada dalam Grup !'

  // Use the exact raw JID present in participants to avoid format mismatch
  await conn.groupParticipantsUpdate(m.chat, [matched.raw], 'remove')
  m.reply(`Success`)
}
handler.help = ['kick', '-'].map(v => 'o' + v + ' @user')
handler.tags = ['owner']
handler.command = /^(okick|o-)$/i

handler.owner = true
handler.group = true
handler.botAdmin = true

export default handler

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms))
