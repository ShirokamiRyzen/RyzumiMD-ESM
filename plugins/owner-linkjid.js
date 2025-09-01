let handler = async function (m, { args, usedPrefix }) {
  if (args.length < 2) throw `Gunakan: ${usedPrefix}linkjid <lid@lid> <628xxxx>`
  const lid = String(args[0]).trim()
  const phone = String(args[1]).replace(/\D/g, '')
  if (!/@lid$/i.test(lid)) throw 'Argumen 1 harus LID, contoh: 100798872690841@lid'
  if (!phone) throw 'Nomor tidak valid.'
  const jid = phone + '@s.whatsapp.net'
  const map = global.db.data.lidMap || (global.db.data.lidMap = {})
  map[lid] = jid
  if (global.db.data.users[lid] && !global.db.data.users[jid]) {
    global.db.data.users[jid] = global.db.data.users[lid]
  }
  delete global.db.data.users[lid]
  m.reply(`Linked: ${lid} -> ${jid}`)
}
handler.help = ['linkjid <lid> <628xxxx>']
handler.tags = ['owner']
handler.command = /^linkjid$/i

handler.rowner = true
export default handler
