let handler = async (m, { conn, usedPrefix, command, args: [event], text }) => {
    if (!event) return await conn.reply(m.chat, `Contoh:
${usedPrefix + command} welcome @user
${usedPrefix + command} bye @user
${usedPrefix + command} promote @user
${usedPrefix + command} demote @user

Bisa juga kirim nomor langsung: ${usedPrefix + command} welcome 62812xxxxxxx`.trim(), m, null, [['Welcome', '#simulate welcome'], ['Bye', '#simulate bye']])

    // Collect targets from mentions or raw numbers, normalize to JIDs
    const rest = text?.slice(event.length).trim() || ''
    const whoFromMention = conn.parseMention(rest)
    const whoFromNumbers = (rest.match(/\b\d{5,16}\b/g) || []).map(v => v + '@s.whatsapp.net')
    let partRaw = [...new Set([...(whoFromMention || []), ...whoFromNumbers])]
    if (!partRaw.length) partRaw = [m.sender]
    const part = await Promise.all(partRaw.map(async j => conn.getJid ? await conn.getJid(j, m.chat) : j))

    let act = false
    m.reply(`Simulating ${event}...`)
    switch (event.toLowerCase()) {
        case 'add':
        case 'invite':
        case 'welcome':
            act = 'add'
            break
        case 'bye':
        case 'kick':
        case 'leave':
        case 'remove':
            act = 'remove'
            break
        case 'promote':
            act = 'promote'
            break
        case 'demote':
            act = 'demote'
            break
        default:
            return conn.reply(m.chat, 'Event harus salah satu dari: welcome/bye/promote/demote', m)
    }
    if (act) return conn.participantsUpdate({
        id: m.chat,
        participants: part,
        action: act,
        simulate: true
    })
}
handler.help = ['simulate <event> [@mention]']
handler.tags = ['owner']
handler.rowner = true

handler.command = /^(simulate|simulasi)$/i
export default handler