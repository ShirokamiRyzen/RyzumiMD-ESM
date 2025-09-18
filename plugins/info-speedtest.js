import { promisify } from 'util'
import { exec as execCallback } from 'child_process'
import os from 'os'

const exec = promisify(execCallback)

const handler = async (m, { conn }) => {
    await m.reply('*Sedang mengukur kecepatan internet...*\n\nMohon tunggu sebentar, proses ini membutuhkan waktu sekitar 30-60 detik.')

    try {
        const isWindows = os.platform() === 'win32'
        const pythonCmd = isWindows ? 'python' : 'python3'
        const command = `${pythonCmd} speed.py --share --secure`

        const { stdout } = await exec(command)
        await m.reply(stdout.trim())
    } catch (error) {
        console.error('Speedtest error:', error)

        try {
            await m.reply('*Mencoba metode alternatif...*')

            const { stdout } = await exec(`curl -s https://raw.githubusercontent.com/sivel/speedtest-cli/master/speedtest.py | python3 - --simple`)
            const lines = stdout.trim().split('\n')

            if (lines.length >= 3) {
                const ping = lines[0].replace('Ping: ', '').replace(' ms', '')
                const download = lines[1].replace('Download: ', '').replace(' Mbit/s', '')
                const upload = lines[2].replace('Upload: ', '').replace(' Mbit/s', '')

                const resultMsg = `*Hasil Speedtest*\n\n` +
                    `*Download:* ${download} Mbps\n` +
                    `*Upload:* ${upload} Mbps\n` +
                    `*Ping:* ${ping} ms\n\n`

                await m.reply(resultMsg)
            } else {
                throw new Error('Invalid speedtest output')
            }
        } catch (fallbackError) {
            console.error('Fallback speedtest error:', fallbackError)

            try {
                const response = await fetch('https://api.fast.com/netflix/speedtest/v2?https=true&token=YXNkZmFzZGxmbnNkYWZoYXNkZmhrYWxm&urlCount=1')
                const data = await response.json()

                if (data && data[0] && data[0].url) {
                    const testUrl = data[0].url
                    const startTime = Date.now()
                    const testResponse = await fetch(testUrl)
                    const buffer = await testResponse.arrayBuffer()
                    const endTime = Date.now()

                    const duration = (endTime - startTime) / 1000
                    const bytes = buffer.byteLength
                    const mbps = ((bytes * 8) / (duration * 1000000)).toFixed(2)

                    const resultMsg = `*Hasil Speedtest (Alternatif)*\n\n` +
                        `*Download:* ${mbps} Mbps\n` +
                        `*Waktu Test:* ${new Date().toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' })}\n\n` +
                        `*Catatan:* Test menggunakan Fast.com API`
                    await m.reply(resultMsg)
                } else {
                    throw new Error('Fast.com API failed')
                }
            } catch (finalError) {
                console.error('Final speedtest error:', finalError)
                await m.reply('⚠️ Gagal melakukan speedtest dengan semua metode.')
            }
        }
    }
}

handler.help = ['speedtest']
handler.tags = ['info']
handler.command = /^(speedtest|speed)$/i

handler.register = true
handler.rowner = true

export default handler
