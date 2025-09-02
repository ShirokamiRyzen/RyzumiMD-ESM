let handler = async (m, { conn, text }) => {
    if (!text) return conn.reply(m.chat, 'Use example: \n.qrcode Shirokami Ryzen', m)
    conn.sendFile(m.chat, `https://quickchart.io/qr?size=300&margin=2&text=${encodeURIComponent(text)}`, 'qrcode.png', '¯\\_(ツ)_/¯', m)
}

handler.help = ['qrcode <teks>')
handler.tags = ['tools']
handler.command = /^qr(code)?$/i

export default handler