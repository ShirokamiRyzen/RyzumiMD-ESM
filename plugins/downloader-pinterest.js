// Don't delete this credit!!!
// Script by ShirokamiRyzen

import axios from 'axios'

let handler = async (m, { conn, args }) => {
    if (!args[0]) throw 'Please provide a Pinterest URL';
    const sender = m.sender.split('@')[0];
    const url = args[0];


    await m.react('🕓')

    try {
        const { data } = await axios.get(`${APIs.ryzumi}/api/downloader/pinterest?url=${encodeURIComponent(url)}`);

        if (!data || (!data.image && !data.video)) {
            throw 'No available media found';
        }

        const { title, description, isImage, image, video } = data;
        const caption = `${title || 'No Title'}\n\n${description || 'No Description'}`;

        // Fetch image (always required as per instructions)
        let imageBuffer = null;
        if (image && image.url) {
            try {
                const res = await fetch(image.url);
                if (res.ok) {
                    imageBuffer = Buffer.from(await res.arrayBuffer());
                }
            } catch (e) {
                // console.warn('Failed to fetch image:', image.url);
            }
        }

        if (isImage) {
            // Case: isImage = true -> Send image only
            if (imageBuffer) {
                await conn.sendMessage(
                    m.chat, {
                    image: imageBuffer,
                    caption: caption + `\n\n@${sender}`,
                    mentions: [m.sender]
                }, { quoted: m }
                );
            } else {
                throw 'Failed to download image';
            }
        } else {
            // Case: isImage = false -> Send image AND video
            if (imageBuffer) {
                await conn.sendMessage(
                    m.chat, {
                    image: imageBuffer,
                    caption: caption + `\n\nPreview Image | @${sender}`,
                    mentions: [m.sender]
                }, { quoted: m }
                );
            }

            if (video && video.url) {
                try {
                    const videoBuffer = await fetch(video.url).then(async res => Buffer.from(await res.arrayBuffer()));

                    await conn.sendMessage(
                        m.chat, {
                        video: videoBuffer,
                        mimetype: "video/mp4",
                        fileName: `video.mp4`,
                        caption: `Ini videonya, @${sender}`,
                        mentions: [m.sender],
                    }, { quoted: m }
                    );
                } catch (error) {
                    // console.error('Error sending video:', error);
                    await conn.reply(m.chat, `Gagal mengirim video: ${error.message}`, m);
                }
            }
        }

    } catch (error) {
        // console.error('Handler Error:', error);
        conn.reply(m.chat, `Terjadi kesalahan: ${error}`, m);
    }
}

handler.help = ['pinterest'].map(v => v + ' <url>');
handler.tags = ['downloader'];
handler.command = /^(pinterestdl|pindl)$/i;

handler.limit = 2
handler.register = true

export default handler
