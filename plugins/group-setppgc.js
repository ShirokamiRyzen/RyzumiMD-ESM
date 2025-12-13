import { webp2png } from '../lib/webp2mp4.js'
import { S_WHATSAPP_NET } from '@whiskeysockets/baileys'

let handler = async (m, { conn, args }) => {
  let q = m.quoted || m;
  let mime = q.mimetype || q.mediaType || '';
  const setProfilePicture = async (imageBuffer) => {
    return conn.query({
      tag: 'iq',
      attrs: { target: m.chat, to: S_WHATSAPP_NET, type: 'set', xmlns: 'w:profile:picture' },
      content: [{ tag: 'picture', attrs: { type: 'image' }, content: imageBuffer }]
    }).then(() => m.reply('Success'));
  };

  if (/image/.test(mime)) {
    let url = await webp2png(await q.download());
    let image = await generateProfilePicture(url);
    await setProfilePicture(image);
  } else if (args[0] && /https?:\/\//.test(args[0])) {
    let media = await generateProfilePicture(args[0]);
    await setProfilePicture(media);
  } else {
    throw 'Where\'s the media?';
  }
};

handler.help = ['setppgrup']
handler.tags = ['group']
handler.alias = ['setppgc', 'setppgrup', 'setppgroup']
handler.command = /^setpp(gc|grup|group)$/i
handler.group = handler.admin = handler.botAdmin = true

export default handler;

async function generateProfilePicture(mediaUpload) {
  let bufferOrFilePath;

  if (Buffer.isBuffer(mediaUpload)) {
    bufferOrFilePath = mediaUpload;
  } else if (typeof mediaUpload === 'object' && 'url' in mediaUpload) {
    bufferOrFilePath = mediaUpload.url.toString();
  } else if (typeof mediaUpload === 'string') {
    bufferOrFilePath = mediaUpload;
  } else {
    bufferOrFilePath = Buffer.from(mediaUpload.stream);
  }

  const { Jimp } = await import('jimp');
  const jimp = await Jimp.read(bufferOrFilePath);
  const min = jimp.bitmap.width;
  const max = jimp.bitmap.height;
  const cropped = jimp.crop({ x: 0, y: 0, w: min, h: max });
  const scaled = cropped.scaleToFit({ w: 720, h: 720 });

  return new Promise((resolve, reject) => {
    scaled.getBuffer('image/jpeg', (err, buffer) => {
      if (err) reject(err);
      else resolve(buffer);
    });
  });
}
