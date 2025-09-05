import axios from 'axios'

let handler = async (m, { conn, args, usedPrefix, command }) => {
    if (!args[0]) throw `Usage: ${usedPrefix + command} <url>`
    m.reply(wait)

    try {
        let response = await axios.get(`${APIs.ryzumi}/api/downloader/spotify?url=${encodeURIComponent(args[0])}`)
        let data = response.data

        if (data.success) {
            if (data.metadata.playlistName) {
                let playlistName = data.metadata.playlistName
                let cover = data.metadata.cover
                let tracks = data.tracks

                m.reply(`*Playlist:* ${playlistName}\n*Cover:* ${cover}\n*Total Tracks:* ${tracks.length}`)

                for (let i = 0; i < tracks.length; i++) {
                    let track = tracks[i]

                    if (track.success) {
                        let { title, artists, album, cover, releaseDate } = track.metadata
                         conn.sendMessage(m.chat, {
                            document: { url: track.link },
                            mimetype: 'audio/mpeg',
                            fileName: `${title}.mp3`,
                            caption: `
*Title:* ${title}
*Artists:* ${artists}
*Album:* ${album}
*Release Date:* ${releaseDate}
*Cover:* ${cover}
                            `,
                        }, { quoted: m })

                        await conn.delay(1500)
                    } else {
                        m.reply(`Error: Failed to download track ${i + 1}`)
                    }
                }
            } else {
                // Jika URL yang diberikan adalah track tunggal
                let { title, artists, album, cover, releaseDate } = data.metadata
                 conn.sendMessage(m.chat, {
                    document: { url: data.link },
                    mimetype: 'audio/mpeg',
                    fileName: `${title}.mp3`,
                    caption: `
*Title:* ${title}
*Artists:* ${artists}
*Album:* ${album}
*Release Date:* ${releaseDate}
*Cover:* ${cover}
                    `,
                }, { quoted: m })
            }
        } else {
            throw 'Error: Failed to download. Please check the URL and try again.'
        }
    } catch (err) {
        console.error(err)
        throw `Error: ${err.message}`
    }
}

handler.help = ['spotify <url>']
handler.tags = ['downloader']
handler.command = /^(spotify(dl)?)$/i
handler.limit = 2
handler.register = true

export default handler
