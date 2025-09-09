import axios from 'axios'

let handler = async (m, { conn, args }) => {
    const noResi = args[0]
    const ekspedisi = args[1] || ''

    if (!noResi) throw 'Masukkan nomor resi pengiriman.\nContoh: `.cekresi SPXID054330680586 shopee-express`'

    await conn.sendMessage(m.chat, {
        text: wait,
    });

    const ekspedisiList = {
        'acommerce': 'ACOMMERCE',
        'anter-aja': 'ANTERAJA',
        'ark-xpress': 'ARK',
        'grab-express': 'GRAB',
        'gtl-goto-logistics': 'GTL',
        'indah-logistik-cargo': 'INDAH',
        'janio-asia': 'JANIO',
        'jet-express': 'JETEXPRESS',
        'lion-parcel': 'LIONPARCEL',
        'luar-negeri-bea-cukai': 'BEACUKAI',
        'lazada-express-lex': 'LEX',
        'lazada-logistics': 'LEL',
        'ninja': 'NINJA',
        'nss-express': 'NSS',
        'paxel': 'PAXEL',
        'pcp-express': 'PCP',
        'pos-indonesia': 'POS',
        'pt-ncs': 'NCS',
        'qrim-express': 'QRIM',
        'rcl-red-carpet-logistics': 'RCL',
        'sap-express': 'SAP',
        'shopee-express': 'SPX',
        'standard-express-lwe': 'LWE',
        'tiki': 'TIKI',
    };

    try {
        const url = `${APIs.ryzumi}/api/tool/cek-resi?resi=${noResi}${ekspedisi ? `&ekspedisi=${ekspedisi}` : ''}`;
        const res = await axios.get(url);
        const result = res.data;

        if (!result.success || !result.data) {
            if (!ekspedisi) {
                const available = Object.keys(ekspedisiList).join('\n');
                throw `Gagal mendeteksi ekspedisi dari resi.\nCoba sertakan ekspedisi secara manual.\n\nContoh: \`.cekresi SPXIDxxxxxx shopee-express\`\n\nList ekspedisi:\n${available}`;
            } else {
                throw 'Resi tidak ditemukan atau salah.';
            }
        }

        const data = result.data;
        const historyText = data.history?.slice(0, 5).map((item) => `• ${item.tanggal}\n  ${item.keterangan}`).join('\n\n') || 'Tidak ada histori.';

        const infoText = `
📦 *HASIL CEK RESI*

No Resi        : ${data.resi}
Ekspedisi      : ${data.ekspedisi}
Status         : ${data.status}
Tgl Kirim      : ${data.tanggalKirim}
Posisi Akhir   : ${data.lastPosition}
CS Ekspedisi   : ${data.customerService}

🕓 *Riwayat Terbaru:*
${historyText}
`.trim();

        await conn.sendMessage(m.chat, {
            text: infoText,
        });

    } catch (e) {
        const available = Object.keys(ekspedisiList).join('\n');
        await conn.sendMessage(m.chat, {
            text: `Gagal melacak resi:\n\nCoba sertakan ekspedisi secara manual.\n\nContoh: \`.cekresi SPXIDxxxxxx shopee-express\`\n\nList ekspedisi:\n${available}`,
        });
    }
}

handler.help = ['cekresi [no_resi] [ekspedisi]']
handler.tags = ['tool']
handler.command = /^(cekresi|resi)$/i

handler.register = true
handler.limit = true

export default handler
