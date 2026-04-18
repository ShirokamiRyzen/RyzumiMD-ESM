// Don't delete this credit!!!
// Script by ShirokamiRyzen

import axios from 'axios'

let handler = async (m, { conn, args }) => {
    if (!args[0]) throw 'Please provide a Facebook URL';

    await m.react('🕓')

    try {
        const { data } = await axios.get(`${APIs.ryzumi}/api/downloader/facebook?url=${encodeURIComponent(args[0])}`);

        if (!data.success || !data.result) throw 'No available media found';

        const result = data.result;
        const media = result.media;
        
        // Filter videos: HD first, then fallback to SD
        let selectedVideos = (media.videos || []).filter(v => v.quality === 'hd');
        if (selectedVideos.length === 0) selectedVideos = (media.videos || []).filter(v => v.quality === 'sd');
        
        const selectedImages = media.images || [];
        const allMedia = [...selectedVideos, ...selectedImages];

        if (allMedia.length === 0) throw 'No available media found';

        let first = true;
        for (const item of allMedia) {
            const caption = first ? (result.caption || result.title || `Ini kak videonya @${m.sender.split('@')[0]}`) : '';
            
            if (item.type === 'video') {
                await conn.sendMessage(m.chat, {
                    video: { url: item.url },
                    mimetype: "video/mp4",
                    fileName: `video.mp4`,
                    caption: caption,
                    mentions: [m.sender],
                }, { quoted: m });
            } else if (item.type === 'image') {
                await conn.sendMessage(m.chat, {
                    image: { url: item.url },
                    caption: caption,
                    mentions: [m.sender],
                }, { quoted: m });
            }
            first = false;
        }
        
    } catch (error) {
        console.error('Handler Error:', error);
        conn.reply(m.chat, `An error occurred: ${error.message || error}`, m);
    }
}

handler.help = ['fb <url>']
handler.tags = ['downloader']
handler.command = /^(fbdownload|facebook|fb(dl)?)$/i
handler.limit = true
handler.register = true

export default handler

