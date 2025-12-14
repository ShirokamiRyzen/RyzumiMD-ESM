import fetch from 'node-fetch'
import moment from 'moment-timezone'

let previousData = []

// Interval wrapper to prevent multiple intervals on reload
if (global.animeUpdateInterval) clearInterval(global.animeUpdateInterval)

global.animeUpdateInterval = setInterval(async () => {
    try {
        const response = await fetch(`${APIs.ryzumi}/api/otakudesu/anime?type=ongoing`)
        if (!response.ok) return // Silently fail on network error to avoid spamming logs
        const currentData = await response.json()

        // Initialize if empty
        if (!previousData || previousData.length === 0) {
            previousData = currentData
            return
        }

        let updates = []
        for (let item of currentData) {
            // Find in previous
            const oldItem = previousData.find(i => i.slug === item.slug)

            // New anime or episode update
            // Check if item is new
            if (!oldItem) {
                updates.push(item)
            } else {
                // Check episode change
                // item.eps is array usually like [" ", " 12"]
                const oldEp = oldItem.eps && oldItem.eps.length > 1 ? oldItem.eps[1].trim() : ''
                const newEp = item.eps && item.eps.length > 1 ? item.eps[1].trim() : ''

                if (oldEp !== newEp) {
                    updates.push(item)
                }
            }
        }

        // Update previous data
        previousData = currentData

        // Broadcast updates
        if (updates.length > 0) {
            const time = moment().tz('Asia/Jakarta').format('DD/MM/YYYY HH:mm:ss')
            // Find chats that enabled the feature
            const chats = Object.entries(global.db.data.chats || {}).filter(([jid, chat]) => chat.ryzuminimeUpdate)

            if (chats.length === 0) return

            for (let [jid, chat] of chats) {
                for (let up of updates) {
                    let caption = `*🎬 ANIME UPDATE*\n\n`
                    caption += `📺 *Judul:* ${up.judul}\n`
                    caption += `🔢 *Episode:* ${up.eps && up.eps.length > 1 ? up.eps[1].trim() : '?'}\n`
                    caption += `📅 *Hari:* ${up.rate && up.rate.length > 1 ? up.rate[1] : '?'}\n`
                    caption += `🔗 *Link:* https://ryzumi.vip/anime/${up.slug}\n`
                    caption += `\n_${time}_`

                    // Use global.conn to send
                    if (global.conn) {
                        await global.conn.sendMessage(jid, {
                            image: { url: up.gambar },
                            caption: caption
                        }).catch(e => console.log(`Error sending anime update to ${jid}:`, e))

                        // Delay to prevent spam/ban
                        await new Promise(r => setTimeout(r, 2000))
                    }
                }
            }
        }

    } catch (e) {
        console.error('Error in Anime Ryzuminime Update:', e)
    }
}, 5 * 60 * 1000) // 5 minutes

// Handler provides status info
let handler = async (m) => {
    m.reply(`*Anime Update System*\n\nStatus: Running\nInterval: 5 minutes\n\nUse *.enable ryzuminime-update* to subscribe.`)
}

handler.help = ['checkryzumi']
handler.tags = ['anime']
handler.command = /^(checkryzumi)$/i
handler.owner = true

export default handler
