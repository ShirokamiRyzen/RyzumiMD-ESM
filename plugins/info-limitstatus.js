let handler = async (m, { conn }) => {
    let chat = global.db.data.chats[m.chat]
    let user = global.db.data.users[m.sender]

    if (!m.isGroup) {
        // Private chat - show user limit only
        let limitInfo = `╭━━━━「 *LIMIT INFO* 」━━━━
┃ 👤 *User:* @${m.sender.split('@')[0]}
┃ 🎫 *Your Limit:* ${user.limit || 0}
┃ 👑 *Role:* ${user.role || 'Free user'}
┃ 
┃ 💡 *Note:* Limit system only applies to certain commands
╰━━━━━━━━━━━━━━━━━`

        return conn.reply(m.chat, limitInfo, m, { mentions: [m.sender] })
    }

    // Group chat - show group and user limit info
    let isLimitDisabled = chat && chat.disableLimit
    let status = isLimitDisabled ? '✅ DISABLED (FREE)' : '⚠️ ENABLED (NORMAL)'
    let statusEmoji = isLimitDisabled ? '🎉' : '🎫'

    let groupInfo = `╭━━━━「 *GROUP LIMIT STATUS* 」━━━━
┃ ${statusEmoji} *Limit Status:* ${status}
┃ 
┃ ${isLimitDisabled ? '✨ All members in this group have unlimited access!' : '⚡ Normal limit applies to all non-premium members'}
┃ 
┃ ━━━━━━━━━━━━━━━
┃ 👤 *Your Info:*
┃ 🎫 *Your Limit:* ${user.limit || 0}
┃ 👑 *Role:* ${user.role || 'Free user'}
┃ 
┃ ━━━━━━━━━━━━━━━
┃ 💡 *Admin Commands:*
┃ • \`.disable limit\` - Disable limit (FREE)
┃ • \`.enable limit\` - Enable limit (NORMAL)
╰━━━━━━━━━━━━━━━━━`

    conn.reply(m.chat, groupInfo, m, { mentions: [m.sender] })
}

handler.help = ['limitstatus', 'limitinfo']
handler.tags = ['info', 'group']
handler.command = /^(limitstatus|limitinfo|ceklimit)$/i

export default handler
