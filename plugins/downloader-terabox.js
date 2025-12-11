
import axios from 'axios'

let handler = async (m, { conn, args }) => {
    if (!args[0]) throw 'Please provide a Terabox URL';

    await m.react('🕓')

    try {
        const { data } = await axios.get(`${APIs.ryzumi}/api/downloader/terabox`, {
            params: { url: args[0] }
        });

        if (data.status !== 'ok') throw 'Failed to fetch data or invalid URL';

        const file = data.list && data.list.length > 0 ? data.list[0] : {};
        const downloadUrl = data.dlink || file.dlink;
        const filename = file.server_filename || 'file';
        const size = file.size ? formatSize(parseInt(file.size)) : 'Unknown';

        if (!downloadUrl) throw 'No download link found';

        await conn.sendMessage(m.chat, {
            document: { url: downloadUrl },
            fileName: filename,
            mimetype: 'application/octet-stream',
            caption: `*Filename:* ${filename}\n*Size:* ${size}\n\n_Powered by Ryzumi API_`
        }, { quoted: m });

    } catch (error) {
        console.error('Handler Error:', error);
        conn.reply(m.chat, `Terjadi kesalahan: ${error?.message || error}`, m);
    }
}

function formatSize(bytes) {
    if (!bytes || bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

handler.help = ['terabox'].map(v => v + ' <url>');
handler.tags = ['downloader'];
handler.command = /^(terabox|tera)$/i;
handler.limit = true
handler.register = true

export default handler
