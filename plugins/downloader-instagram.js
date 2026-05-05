// Don't delete this credit!!!
// Script by ShirokamiRyzen

import axios from 'axios'
import fs from 'fs'
import os from 'os'
import path from 'path'
import { exec } from 'child_process'

let handler = async (m, { conn, args }) => {
    if (!args[0]) throw 'Please provide an Instagram URL';

    const withAudio = (args[1] || '').includes('--with-audio');
    const url = args[0];

    await m.react('🕓')

    try {
        const { data } = await axios.get(`${APIs.ryzumi}/api/downloader/instagram?url=${encodeURIComponent(url)}`);

        if (!data.success || !data.result) throw 'No available media found';

        const result = data.result;
        const media = result.media;

        let allMedia = [...(media.videos || []), ...(media.images || [])];
        if (withAudio) allMedia = [...allMedia, ...(media.audio || [])];

        if (allMedia.length === 0) throw 'No available media found';

        let first = true;
        for (const item of allMedia) {
            const caption = (first && item.type !== 'audio') ? (result.title || `Ini kak @${m.sender.split('@')[0]}`) : '';
            const mediaUrl = item.url;

            try {
                const videoIndex = media.videos ? media.videos.findIndex(v => v.url === item.url) : -1;
                const hasMatchingAudio = videoIndex !== -1 && media.audio && media.audio.length > videoIndex;

                if (item.type === 'video' && item.isAudio === false && hasMatchingAudio) {
                    const videoUrl = item.url;
                    const audioUrl = media.audio[videoIndex].url;

                    const headers = {
                        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/111.0.0.0 Safari/537.36'
                    };

                    const [vidRes, audRes] = await Promise.all([
                        axios.get(videoUrl, { responseType: 'arraybuffer', timeout: 30000, headers }),
                        axios.get(audioUrl, { responseType: 'arraybuffer', timeout: 30000, headers })
                    ]);

                    const randStr = Math.random().toString(36).substring(7);
                    const tmpVid = path.join(os.tmpdir(), `vid_${Date.now()}_${randStr}.mp4`);
                    const tmpAud = path.join(os.tmpdir(), `aud_${Date.now()}_${randStr}.m4a`);
                    const tmpOut = path.join(os.tmpdir(), `out_${Date.now()}_${randStr}.mp4`);

                    try {
                        fs.writeFileSync(tmpVid, Buffer.from(vidRes.data));
                        fs.writeFileSync(tmpAud, Buffer.from(audRes.data));

                        await new Promise((resolve, reject) => {
                            exec(`ffmpeg -i "${tmpVid}" -i "${tmpAud}" -c:v copy -c:a aac -map 0:v:0 -map 1:a:0 -shortest "${tmpOut}"`, (err) => {
                                if (err) return reject(err);
                                resolve();
                            });
                        });

                        const mergedBuffer = fs.readFileSync(tmpOut);
                        await conn.sendMessage(m.chat, {
                            video: mergedBuffer,
                            mimetype: "video/mp4",
                            fileName: `video.mp4`,
                            caption: caption,
                            mentions: [m.sender],
                        }, { quoted: m });
                    } finally {
                        if (fs.existsSync(tmpVid)) fs.unlinkSync(tmpVid);
                        if (fs.existsSync(tmpAud)) fs.unlinkSync(tmpAud);
                        if (fs.existsSync(tmpOut)) fs.unlinkSync(tmpOut);
                    }
                } else {
                    const res = await axios.get(mediaUrl, {
                        responseType: 'arraybuffer',
                        timeout: 30000,
                        headers: {
                            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/111.0.0.0 Safari/537.36'
                        }
                    });
                    const buffer = Buffer.from(res.data);

                    if (item.type === 'video') {
                        await conn.sendMessage(m.chat, {
                            video: buffer,
                            mimetype: "video/mp4",
                            fileName: `video.mp4`,
                            caption: caption,
                            mentions: [m.sender],
                        }, { quoted: m });
                    } else if (item.type === 'image') {
                        await conn.sendMessage(m.chat, {
                            image: buffer,
                            caption: caption,
                            mentions: [m.sender],
                        }, { quoted: m });
                    } else if (item.type === 'audio') {
                        await conn.sendMessage(m.chat, {
                            audio: buffer,
                            mimetype: item.mimetype || "audio/mpeg",
                            fileName: `audio.mp3`,
                        }, { quoted: m });
                    }
                }
            } catch (e) {
                console.error('Error sending media item:', e);
            }

            if (item.type !== 'audio') first = false;
        }
    } catch (error) {
        console.error('Handler Error:', error);
        conn.reply(m.chat, `An error occurred: ${error.message || error}`, m);
    }
}

handler.help = ['ig <url>']
handler.tags = ['downloader']
handler.command = /^(ig(dl)?)$/i
handler.limit = true
handler.register = true

export default handler

