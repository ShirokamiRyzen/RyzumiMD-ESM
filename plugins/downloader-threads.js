// Don't delete this credit!!!
// Script by ShirokamiRyzen

import axios from 'axios'
import fetch from 'node-fetch'

let handler = async (m, { conn, args }) => {
    if (!args[0]) throw 'Please provide a Threads URL';
    m.reply(wait);

    try {
        const { data } = await axios.get(`${APIs.ryzumi}/api/downloader/threads?url=${encodeURIComponent(args[0])}`);

        const images = data.image_urls || data.images || [];
        const videos = data.video_urls || data.videos || [];

        if ((images?.length || 0) === 0 && (videos?.length || 0) === 0) {
            throw 'No media found in that Threads post';
        }

        // Send video
        if (videos.length > 0) {
            await conn.sendMessage(
                m.chat, {
                    video: { url: videos[0].download },
                    mimetype: "video/mp4",
                    fileName: `threads_video.mp4`,
                    caption: `Ini kak videonya @${m.sender.split('@')[0]}`,
                    mentions: [m.sender]
                }, {
                    quoted: m
                }
            );
        }

        // Send all images
        if (images.length > 0) {
            for (const item of images) {
                 conn.sendMessage(
                    m.chat, {
                        image: { url: item.download },
                        caption: `Ini kak videonya @${m.sender.split('@')[0]}`,
                        mentions: [m.sender]
                    }, {
                        quoted: m
                    }
                );
            }
        }

    } catch (error) {
        console.error('Handler Error:', error);
        conn.reply(m.chat, `Terjadi kesalahan: ${error.message || error}`, m);
    }
}

handler.help = ['threads'].map(v => v + ' <url>');
handler.tags = ['downloader'];
handler.command = /^(threads(dl)?)$/i;
handler.limit = true
handler.register = true

export default handler
