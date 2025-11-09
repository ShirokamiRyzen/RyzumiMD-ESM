import axios from 'axios'

let handler = async (m, { conn, args }) => {
    const platInput = args.join(' ') || args[0] || ''
    if (!platInput) throw 'Masukkan nomor plat. Contoh: `.cekpajak T1234CD` atau `.cekpajak T 1234 CD`'

    await conn.sendMessage(m.chat, { text: wait })

    const raw = String(platInput).trim().toUpperCase().replace(/[-.]/g, ' ').replace(/\s+/g, ' ')
    const simple = raw.replace(/\s+/g, '')

    let formatted = simple
    const re = /^([A-Z]+)(\d+)([A-Z]+)$/i
    const mmatch = simple.match(re)
    if (mmatch) {
        const [, prefix, numbers, suffix] = mmatch
        formatted = `${prefix}+${suffix}+${numbers}`
    } else {
        const parts = raw.split(' ').filter(Boolean)
        if (parts.length === 3) {
            formatted = `${parts[0]}+${parts[2]}+${parts[1]}`
        } else {
            formatted = raw
        }
    }

    try {
        const url = `${APIs.ryzumi}/api/tool/cek-pajak/bapenda?plat=${encodeURIComponent(formatted)}`
        const res = await axios.get(url)
        const result = res.data

        if (!result || !result.success) {
            const msg = result && result.message ? `Gagal: ${result.message}` : 'Gagal mengambil data pajak.'
            return await conn.sendMessage(m.chat, { text: msg })
        }

        const d = result.data
        const info = d['informasi-umum'] || {}
        const pkb = d['pembayaran-pkb-pnbp'] || {}
        const pkbNon = d['pembayaran-pkb-pnbp-non-program'] || {}
        const pkbInfo = d['informasi-pkb-pnbp'] || {}

        const out = `
📄 *CEK PAJAK BAPENDA*

• Nomor Polisi : ${info['nomor-polisi'] || '-'}
• Merk / Model : ${info['merk'] || '-'} / ${info['model'] || '-'}
• Warna        : ${info['warna'] || '-'}
• Jenis        : ${info['jenis'] || '-'}
• Tahun Buat   : ${info['tahun-buatan'] || '-'}

🧾 *Informasi PKB / STNK*
• Periode      : ${pkbInfo['dari'] || '-'} → ${pkbInfo['ke'] || '-'}
• Tgl Pajak    : ${pkbInfo['tanggal-pajak'] || '-'}
• Tgl STNK     : ${pkbInfo['tanggal-stnk'] || '-'}
• Wilayah      : ${pkbInfo['wilayah'] || '-'}

💸 *Pembayaran (Program)*
• PKB Pokok    : ${pkb['pkb-pokok'] ?? '-'}
• Opsi PKB     : ${pkb['opsen-pkb-pokok'] ?? '-'}
• SWDKLLJ      : ${pkb['swdkllj-pokok'] ?? '-'}
• Total        : ${pkb['total'] ?? '-'}

💸 *Pembayaran (Non-Program)*
• PKB Pokok    : ${pkbNon['pkb-pokok'] ?? '-'}
• Opsi PKB     : ${pkbNon['opsen-pkb-pokok'] ?? '-'}
• SWDKLLJ      : ${pkbNon['swdkllj-pokok'] ?? '-'}
• Total        : ${pkbNon['total'] ?? '-'}

⏱️ Diproses : ${d['tanggal-proses'] || '-'}
✔️ Bisa dibayar : ${d['canBePaid'] ? 'Ya' : 'Tidak'}
`.trim()

        await conn.sendMessage(m.chat, { text: out })

    } catch (e) {
        await conn.sendMessage(m.chat, {
            text: `Gagal mengambil data pajak.\n\nError: ${e.message || e}`
        })
    }
}

handler.help = ['cekpajak [Plat]']
handler.tags = ['tool']
handler.command = /^(cekpajak|bapenda)$/i

handler.register = true
handler.limit = true

export default handler
