let handler = async (m, { conn, args, text }) => {
  const q = m.quoted ? m.quoted : m;
  const mime = (q.msg || q).mimetype || '';

  // Early validation: ensure we actually have a media message structure
  if (!q.mediaType || !/image|video|webp/.test(mime)) {
    return m.reply('Reply (balas) gambar, video, atau stiker dengan perintah .s untuk membuat stiker.');
  }

  // Treat GIFs as videos (WhatsApp sends them as mp4); guard for duration
  const isVideoLike = /video|gif/.test(mime) || (q.mediaType === 'videoMessage');
  const seconds = Number(q.msg?.seconds || q.seconds || q.duration || 0);
  if (isVideoLike && seconds > 10) {
    return m.reply('Video harus berdurasi di bawah 10 detik.');
  }

  let media;
  try {
    media = await q.download();
  } catch (e) {
    return m.reply('Gagal mengambil media: ' + e.message);
  }

  let exif;
  if (text) {
    const [packname, author] = text.split(/[,|\-+&]/);
    exif = { packName: packname?.trim() || '', packPublish: author?.trim() || '' };
  }
  return conn.sendSticker(m.chat, media, m, exif);
};

handler.help = ['maker']
handler.tags = ['maker']
handler.command = /^s(tic?ker)?(gif)?$/i
handler.register = true

export default handler