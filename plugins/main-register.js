import { createHash } from 'crypto'

let Reg = /\|?(.*)([.|] *?)([0-9]*)$/i
let handler = async function (m, { text, usedPrefix }) {
  // Normalize sender: if privacy LID, map to classic JID and persist the mapping
  const senderJid = m.sender
  let user = global.db.data.users[senderJid]
  try {
    // On registration, try to resolve real JID via onWhatsApp for this contact
    const wa = await this.onWhatsApp(senderJid).catch(() => [])
    const { jid: resolvedJid, exists, lid } = Array.isArray(wa) && wa[0] ? wa[0] : { exists: false }
    if (exists) {
      // Save lid -> real jid map when available
      const lidMap = global.db.data.lidMap || (global.db.data.lidMap = {})
      if (resolvedJid) {
        if (lid && lid !== resolvedJid) lidMap[lid] = resolvedJid
        // Fallback: use current sender if it is already a LID-style JID
        if (senderJid.endsWith('@lid')) lidMap[senderJid] = resolvedJid
      }
      // If current key uses LID and user object is on classic JID, merge & switch
      if (senderJid.endsWith('@lid') && resolvedJid) {
        // Migrate any existing per-sender data if necessary
        if (!global.db.data.users[resolvedJid]) global.db.data.users[resolvedJid] = global.db.data.users[senderJid] || {}
        user = global.db.data.users[resolvedJid]
        // Remove the temporary @lid bucket to avoid duplicates
        if (global.db.data.users[senderJid]) delete global.db.data.users[senderJid]
      }
    }
  } catch {}
  if (user.registered === true) throw `Anda sudah terdaftar\nMau daftar ulang? ${usedPrefix}unreg <SERIAL NUMBER>`
  if (!Reg.test(text)) throw `Format salah\n*${usedPrefix}register nama.umur*`
  let [_, name, splitter, age] = text.match(Reg)
  if (!name) throw 'Nama tidak boleh kosong (Alphanumeric)'
  if (!age) throw 'Umur tidak boleh kosong (Angka)'
  age = parseInt(age)
  if (age > 120) throw 'Umur terlalu tua 😂'
  if (age < 16) throw 'Esempe dilarang masuk 😂'
  user.name = name.trim()
  user.age = age
  user.regTime = + new Date
  user.registered = true
  let sn = createHash('md5').update(m.sender).digest('hex')
  m.reply(`
Daftar berhasil!

╭─「 Info 」
│ Nama: ${name}
│ Umur: ${age} tahun 
╰────
Serial Number: 
${sn}

**Ketentuan Layanan (TOS) - Ryzumi-MD ESM**
Dengan menggunakan Ryzumi-MD ESM, Anda setuju dengan ketentuan berikut:

1. *DILARANG KERAS MERUBAH TIMER/PESAN SEMENTARA*
Bot akan secara otomatis melakukan banning terhadap nomormu, untuk unban silahkan lapor owner (+${global.nomorown}).

2. *DILARANG MENGIRIM MEDIA NSFW*
Bot akan otomatis mendeteksi media dan melakukan banning terhadap nomormu, untuk unban silahkan lapor owner (+${global.nomorown}).

3. *DILARANG SPAM NOMOR BOT*
Bot akan melakukan ban permanent jika ada indikasi spam pada nomormu.

4. *CHAT OWNER BILA PERLU*
Tidak ada gunanya chat ke nomor bot, karena nomor bot tersimpan di server dan owner tidak akan melihat chatmu.

Dengan menggunakan Ryzumi-MD ESM, Anda setuju dengan semua ketentuan yang berlaku.

*Ketentuan ini terakhir diperbarui pada 12 Mei 2024.*

Mendaftar berarti setuju dengan ketentuan
`.trim())
}

handler.help = ['daftar', 'register'].map(v => v + ' <nama>.<umur>')

handler.command = /^(daftar|reg(ister)?)$/i

handler.owner = true
handler.group = false
export default handler
