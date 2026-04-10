// Don't delete this credit!!!
// Script by ShirokamiRyzen

import axios from 'axios'

let handler = async (m, { conn, args }) => {
    if (!args[0]) throw 'Please provide a Threads URL';

    await m.react('🕓')

    try {
        const { data } = await axios.get(`${APIs.ryzumi}/api/downloader/threads?url=${encodeURIComponent(args[0])}`);

        if (!data.success || !data.result) throw 'Gagal mengambil data dari API';

        const medias = data.result.media || [];

        if (medias.length === 0) {
            throw 'No media found in that Threads post';
        }

        for (let i = 0; i < medias.length; i++) {
            const item = medias[i];
            const isVideo = item.type === 'video';
            const isImage = item.type === 'image';

            if (!isVideo && !isImage) continue;

            // Only send caption on the first media to avoid spamming the chat
            let msgCaption = '';
            if (i === 0) {
                msgCaption = `Ini ${isVideo ? 'videonya' : 'fotonya'} kak @${m.sender.split('@')[0]}\n\n*Caption:* ${data.result.caption || ''}`;
            }

            await conn.sendMessage(
                m.chat,
                {
                    [isVideo ? 'video' : 'image']: { url: item.url },
                    caption: msgCaption.trim(),
                    mentions: i === 0 ? [m.sender] : [],
                },
                { quoted: m }
            );
        }

    } catch (error) {
        conn.reply(m.chat, `Terjadi kesalahan: ${error?.message || error}`, m);
    }
}

handler.help = ['threads'].map(v => v + ' <url>');
handler.tags = ['downloader'];
handler.command = /^(threads(dl)?)$/i;
handler.limit = true
handler.register = true

export default handler
