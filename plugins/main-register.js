import { createHash } from 'crypto'

let Reg = /\|?(.*)([.|] *?)([0-9]*)$/i
let handler = async function (m, { text, usedPrefix }) {
  let user = global.db.data.users[m.sender]
  if (user.registered === true) throw `Anda sudah terdaftar\nMau daftar ulang? ${usedPrefix}unreg <SERIAL NUMBER>`
  if (!Reg.test(text)) throw `Format salah\n*${usedPrefix}register nama.umur*`
  let [_, name, splitter, age] = text.match(Reg)
  if (!name) throw 'Nama tidak boleh kosong (Alphanumeric)'
  if (!age) throw 'Umur tidak boleh kosong (Angka)'
  age = parseInt(age)
  if (age > 60) throw 'Tuwa Bangka Mana Paham Teknologi😂'
  if (age < 16) throw 'Esempe dilarang masuk 😂'
  user.name = name.trim()
  user.age = age
  user.regTime = Date.now()
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

**Ketentuan Layanan (TOS) - ${global.namebot}**
Dengan menggunakan ${global.namebot}, Anda setuju dengan ketentuan berikut:

1. *DILARANG KERAS MERUBAH TIMER/PESAN SEMENTARA*
2. *DILARANG MENGIRIM MEDIA NSFW*
3. *DILARANG SPAM NOMOR BOT*
4. *CHAT OWNER BILA PERLU*

Dengan menggunakan ${global.namebot}, Anda setuju dengan semua ketentuan yang berlaku.

*Ketentuan ini terakhir diperbarui pada 9 September 2025.*

Mendaftar berarti setuju dengan ketentuan
`.trim())
}

handler.help = ['daftar', 'register'].map(v => v + ' <nama>.<umur>')
handler.command = /^(daftar|reg(ister)?)$/i

export default handler