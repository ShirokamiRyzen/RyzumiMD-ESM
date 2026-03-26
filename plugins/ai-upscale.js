import fetch from 'node-fetch'
import { uploadPomf } from '../lib/uploadImage.js'

let handler = async (m, { conn, usedPrefix }) => {
  try {
    await m.react('🕓')
    let q = m.quoted ? m.quoted : m;
    let mime = (q.msg || q).mimetype || '';
    if (!mime || !mime.startsWith('image/')) throw `Kirim/Reply Gambar dengan caption ${usedPrefix}upscale`;

    let media = await q.download();
    let url = await uploadPomf(media);

    let apiUrl = `${APIs.ryzumi}/api/ai/upscaler?url=${url}`;
    let response = await fetch(apiUrl);
    if (!response.ok) throw new Error('Gagal mengambil gambar dari API');

    let hasil = Buffer.from(await response.arrayBuffer());

    await conn.sendFile(m.chat, hasil, 'upscale.jpg', global.wm, m);

    let epoch = Date.now();
    let random = Math.floor(Math.random() * 99999);
    let filename = `upscale_${random}_${epoch}_file.png`;

    await conn.sendFile(m.chat, hasil, filename, '', m, null, { mimetype: 'image/png', asDocument: true });
  } catch (error) {
    m.reply(`Error: ${error.message}`);
  }
};

handler.help = ['upscale']
handler.tags = ['ai']
handler.command = /^(hd|upscale)$/i

handler.register = true
handler.limit = 10

export default handler
