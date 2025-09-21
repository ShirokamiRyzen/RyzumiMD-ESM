import fetch from "node-fetch"

let handler = async (m, { conn, args, usedPrefix, command }) => {
    if (!args[0]) throw `Contoh:\n${usedPrefix + command} https://t.me/addstickers/sshaaaaa`
    if (!args[0].match(/(https:\/\/t.me\/addstickers\/)/gi)) throw `URL-nya gak valid, Sayang~`

    let apiUrl = `${APIs.ryzumi}/api/image/sticker-tele?url=${encodeURIComponent(args[0])}`
    let res = await fetch(apiUrl)
    if (!res.ok) throw `Err: ${res.status}`

    let json = await res.json()
    let stickers = json.stickers?.stickers || []
    if (!stickers.length) throw `Sticker not found`

    m.reply(`*Total stiker:* ${stickers.length}`)

    for (let s of stickers) {
        if (!s.is_animated && s.image_url) {
            try {
                let imgRes = await fetch(s.image_url)
                conn.sendSticker(m.chat, imgRes, m)
                await delay(5000)
            } catch (e) {
                console.error(`Gagal proses stiker: ${e}`)
            }
        }
    }

    throw `*Done*`
}

handler.help = ['stickertele']
handler.tags = ['maker']
handler.command = /^(stic?kertele(gram)?)$/i
handler.limit = 15
handler.register = true

export default handler

const delay = time => new Promise(res => setTimeout(res, time))
