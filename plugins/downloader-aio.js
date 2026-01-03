import axios from "axios"

let handler = async (m, { conn, args, usedPrefix, command }) => {
    if (!args[0]) throw `Usage: ${usedPrefix + command} <url>`;

    await m.react('🕓')

    try {
        let response = await axios.get(`${APIs.ryzumi}/api/downloader/all-in-one?url=${encodeURIComponent(args[0])}`);
        let data = response.data;

        if (!data || !data.medias || data.medias.length === 0) throw 'Media not found or API error';

        let { title, source, author, medias } = data;
        let caption = `*${title || 'Desc not found...'}*\n\n*Source:* ${source || 'Unknown'}\n*Author:* ${author?.name || author?.username || 'Unknown'}`.trim();

        for (let i = 0; i < medias.length; i++) {
            let media = medias[i];
            let msgCaption = i === 0 ? caption : '';

            if (media.type === 'video') {
                await conn.sendMessage(m.chat, {
                    video: { url: media.url },
                    caption: msgCaption,
                    mimetype: 'video/mp4'
                }, { quoted: m });
            } else if (media.type === 'image') {
                await conn.sendMessage(m.chat, {
                    image: { url: media.url },
                    caption: msgCaption
                }, { quoted: m });
            } else if (media.type === 'audio') {
                await conn.sendMessage(m.chat, {
                    audio: { url: media.url },
                    mimetype: media.extension === 'm4a' ? 'audio/mp4' : 'audio/mpeg',
                    ptt: false
                }, { quoted: m });
            }
        }

    } catch (e) {
        console.error(e)
        throw `Error: ${e.response?.data?.message || e.message}`;
    }
}

handler.help = ['aio']
handler.tags = ['downloader']
handler.command = /^(aio|aiodl)$/i
handler.register = true
handler.limit = 2

export default handler
