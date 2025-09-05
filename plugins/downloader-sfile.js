import * as cheerio from 'cheerio'
import fetch from 'node-fetch'

let handler = async (m, { conn, text }) => {
    if (text.match(/(https:\/\/sfile.mobi\/)/gi)) {
        let res = await download(text)
        if (!res) throw 'Tidak Dapat Mengunduh File'
        await m.reply(Object.keys(res).map(v => `*• ${v.capitalize()}:* ${res[v]}`).join('\n') + '\n\n_Sending file..._')
        const buff = Buffer.from(await (await fetch(res.download)).arrayBuffer());
        conn.sendMessage(m.chat, {
            document: buff,
            fileName: res.filename,
            mimetype: res.mimetype
        }, {
            quoted: m
        })
    } else if (text) {
        let [query, page] = text.split`|`
        let res = await search(query, page)
        if (!res.length) throw `Query "${text}" not found :/`
        res = res.map((v) => `*Title:* ${v.title}\n*Size:* ${v.size}\n*Link:* ${v.link}`).join`\n\n`
        m.reply(res)
    } else return m.reply('Input Query / Sfile Url!')
}
handler.help = ['sfile']
handler.tags = ['downloader']
handler.command = /^(sfile)$/i
handler.limit = true

export default handler

async function search(query, page = 1) {
    let res = await fetch(`https://sfile.mobi/search.php?q=${query}&page=${page}`)
    let $ = cheerio.load(await res.text())
    let result = []
    $('div.list').each(function() {
        let title = $(this).find('a').text()
        let size = $(this).text().trim().split('(')[1]
        let link = $(this).find('a').attr('href')
        if (link) result.push({
            title,
            size: size.replace(')', ''),
            link
        })
    })
    return result
}

async function download(url) {
    let res = await fetch(url)
    let $ = cheerio.load(await res.text())
    let filename = $('img.intro').attr('alt')
    let mimetype = $('div.list').text().split(' - ')[1].split('\n')[0]
    let dl = $('#download').attr('href')
    let up_at = $('.list').eq(2).text().split(':')[1].trim()
    let uploader = $('.list').eq(1).find('a').eq(0).text().trim()
    let total_down = $('.list').eq(3).text().split(':')[1].trim()

    let data = await fetch(dl)
    let $$ = cheerio.load(await data.text())
    let anu = $$('script').text()
    let download = anu.split('sf = "')[1].split('"')[0].replace(/\\/g, '');

    return {
        filename,
        mimetype,
        upload_at: up_at,
        uploader,
        total_download: total_down,
        download
    }
}