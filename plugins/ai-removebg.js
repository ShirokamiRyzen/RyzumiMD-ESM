import fetch from 'node-fetch'
import { uploadPomf } from '../lib/uploadImage.js'

let handler = async (m, { conn, usedPrefix }) => {
    try {
        await m.react('🕓')
        let q = m.quoted ? m.quoted : m;
        let mime = (q.msg || q).mimetype || '';
        if (!mime || !mime.startsWith('image/')) throw `Kirim/Reply Gambar dengan caption ${usedPrefix}removebg`;

        let media = await q.download();
        let url = await uploadPomf(media);

        let apiUrl = `${APIs.ryzumi}/api/ai/removebg?url=${url}`;
        let response = await fetch(apiUrl);
        if (!response.ok) throw new Error('Gagal mengambil gambar dari API');

        let hasil = Buffer.from(await response.arrayBuffer());

        let epoch = Date.now();
        let random = Math.floor(Math.random() * 99999);
        let filename = `removedbg_${random}_${epoch}_file.png`;

        await conn.sendFile(m.chat, hasil, filename, global.wm, m, null, { mimetype: 'image/png', asDocument: false });
    } catch (error) {
        m.reply(`Error: ${error.message}`);
    }
};

handler.help = ['removebg'];
handler.tags = ['ai'];
handler.command = /^(removebg)$/i;

handler.register = true
handler.limit = 3

export default handler
