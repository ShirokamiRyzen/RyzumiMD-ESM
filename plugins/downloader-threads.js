// Don't delete this credit!!!
// Script by ShirokamiRyzen

import axios from 'axios'

let handler = async (m, { conn, args }) => {
    if (!args[0]) throw 'Please provide a Threads URL';
    m.reply(wait);

    try {
        const { data } = await axios.get(`${APIs.ryzumi}/api/downloader/threads?url=${encodeURIComponent(args[0])}`);

        // Normalizer: dukung array of string atau array of object
        const toMediaList = (arr = []) =>
            arr
                .filter(Boolean)
                .map(item => {
                    if (typeof item === 'string') return { url: item };
                    // urutan fallback: download -> url -> link
                    return { url: item.download || item.url || item.link };
                })
                .filter(x => typeof x.url === 'string' && x.url.length > 0);

        const images = toMediaList(data.image_urls || data.images);
        const videos = toMediaList(data.video_urls || data.videos);

        if (images.length === 0 && videos.length === 0) {
            throw 'No media found in that Threads post';
        }

        // Kirim video pertama (jika ada)
        if (videos.length > 0) {
            await conn.sendMessage(
                m.chat,
                {
                    video: { url: videos[0].url },
                    mimetype: 'video/mp4',
                    fileName: 'threads_video.mp4',
                    caption: `Ini kak videonya @${m.sender.split('@')[0]}`,
                    mentions: [m.sender],
                },
                { quoted: m }
            );
        }

        // Kirim semua gambar (jika ada)
        if (images.length > 0) {
            for (const item of images) {
                await conn.sendMessage(
                    m.chat,
                    {
                        image: { url: item.url },
                        caption: `Ini kak fotonya @${m.sender.split('@')[0]}`,
                        mentions: [m.sender],
                    },
                    { quoted: m }
                );
            }
        }
    } catch (error) {
        console.error('Handler Error:', error);
        conn.reply(m.chat, `Terjadi kesalahan: ${error?.message || error}`, m);
    }
}

handler.help = ['threads'].map(v => v + ' <url>');
handler.tags = ['downloader'];
handler.command = /^(threads(dl)?)$/i;
handler.limit = true
handler.register = true

export default handler
