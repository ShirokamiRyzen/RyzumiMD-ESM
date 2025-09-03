const fetch = globalThis.fetch ?? (await import('node-fetch')).default;

var handler = async (m, { conn, text, usedPrefix, command }) => {
  if (!text) throw `Contoh: ${usedPrefix}${command} Minecraft`;

  try {
    const url = `${APIs.ryzumi}/api/search/gimage?query=${encodeURIComponent(text)}`;
    const res = await fetch(url, { method: 'GET', headers: { accept: 'application/json' } });

    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    const data = await res.json();
    if (!Array.isArray(data) || data.length === 0) {
      return conn.reply(m.chat, 'Maaf, nggak ada hasil untuk pencarian itu.', m);
    }

    const pick = data[Math.floor(Math.random() * data.length)];
    const link = pick.image || pick.url;

    await conn.sendFile(
      m.chat,
      link,
      'google.jpg',
      `*${htki} Google Image ${htka}*\n🔎 *Result:* ${text}\n🌎 *Source:* Google\n`,
      m
    );
  } catch (e) {
    console.error(e);
    conn.reply(m.chat, 'Lagi ada gangguan saat ambil gambar. Coba ulangi ya, Sayang~', m);
  }
};

handler.help = ['gimage <query>', 'image <query>'];
handler.tags = ['internet'];
handler.command = /^(gimage|image)$/i;

handler.register = true
handler.limit = true

export default handler
