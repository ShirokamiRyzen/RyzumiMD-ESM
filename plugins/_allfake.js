import fs from 'fs'
import moment from 'moment-timezone'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Prefer JPEG/PNG for fields that require `jpegThumbnail`.
// Many WhatsApp/Baileys message types ignore WebP buffers for `jpegThumbnail`.
// We'll try to use ryzumi.jpg/jpeg/png if present; otherwise fall back to WebP
// for fields that accept `thumbnail`.
const resolveAsset = (names) => {
    for (const name of names) {
        const p = path.resolve(__dirname, `../${name}`)
        if (fs.existsSync(p)) return p
    }
    return null
}

const thumbWebpPath = resolveAsset(['ryzumi.webp'])
const thumbJpgLikePath = resolveAsset(['ryzumi.jpg', 'ryzumi.jpeg', 'ryzumi.png'])

let handler = m => m
handler.all = async function (m) {
    const pp = await this.profilePictureUrl(m.sender, 'image').catch(e => './src/avatar_contact.png')

    global.doc = pickRandom([
        "application/vnd.ms-excel",
        "application/vnd.openxmlformats-officedocument.presentationml.presentation",
        "application/msword",
        "application/pdf"
    ])

    global.fetch = (await import('node-fetch')).default
    global.fs = fs

    global.ucapan = ucapan()
    global.ephemeral = ''

    // Helper buffers
    const jpegThumbBuffer = thumbJpgLikePath ? fs.readFileSync(thumbJpgLikePath) : null
    const genericThumbBuffer = (thumbWebpPath && fs.existsSync(thumbWebpPath)) ? fs.readFileSync(thumbWebpPath) : (jpegThumbBuffer || null)

    global.adReply = {
        contextInfo: {
            forwardingScore: 256,
            isForwarded: false,
            externalAdReply: {
                title: global.ucapan,
                body: wm,
                mediaUrl: sgw,
                description: namebot,
                previewType: "PHOTO",
                // externalAdReply accepts `thumbnail` and works fine with webp/png/jpg
                thumbnail: genericThumbBuffer || undefined,
                sourceUrl: sgw,
            }
        }
    }

    global.sfb = {
        contextInfo: {
            externalAdReply: {
                title: global.ucapan,
                body: wm,
                thumbnailUrl: pp,
                sourceUrl: sfb
            }
        }
    }

    global.ftroli = {
        key: {
            remoteJid: 'status@broadcast',
            participant: '0@s.whatsapp.net'
        },
        message: {
            orderMessage: {
                itemCount: 999999999999999,
                status: 1,
                surface: 1,
                message: wm,
                orderTitle: wm,
                sellerJid: '0@s.whatsapp.net'
            }
        }
    }

    global.fkontak = {
        key: {
            fromMe: false,
            participant: `0@s.whatsapp.net`,
            ...(m.chat ? {
                remoteJid: `status@broadcast`
            } : {})
        },
        message: {
            contactMessage: {
                displayName: wm,
                vcard: `BEGIN:VCARD\nVERSION:3.0\nN:XL;${wm},;;;\nFN:${wm},\nitem1.TEL;waid=${m.sender.split('@')[0]}:${m.sender.split('@')[0]}\nitem1.X-ABLabell:Ponsel\nEND:VCARD`,
                jpegThumbnail: jpegThumbBuffer || undefined,
                thumbnail: genericThumbBuffer || undefined,
                sendEphemeral: true
            }
        }
    }

    global.fvn = {
        key: {
            fromMe: false,
            participant: `0@s.whatsapp.net`,
            ...(m.chat ? {
                remoteJid: "6282127487538-1625305606@g.us"
            } : {})
        },
        message: {
            audioMessage: {
                mimetype: "audio/ogg; codecs=opus",
                seconds: "999999999999",
                ptt: "true"
            }
        }
    }

    global.ftextt = {
        key: {
            fromMe: false,
            participant: `0@s.whatsapp.net`,
            ...(m.chat ? {
                remoteJid: "6282127487538-1625305606@g.us"
            } : {})
        },
        message: {
            extendedTextMessage: {
                text: wm,
                title: wm,
                jpegThumbnail: jpegThumbBuffer || undefined
            }
        }
    }

    global.fliveLoc = {
        key: {
            fromMe: false,
            participant: `0@s.whatsapp.net`,
            ...(m.chat ? {
                remoteJid: "status@broadcast"
            } : {})
        },
        message: {
            liveLocationMessage: {
                caption: "by : WH MODS DEV",
                h: wm,
                jpegThumbnail: jpegThumbBuffer || undefined
            }
        }
    }

    global.fliveLoc2 = {
        key: {
            fromMe: false,
            participant: `0@s.whatsapp.net`,
            ...(m.chat ? {
                remoteJid: "status@broadcast"
            } : {})
        },
        message: {
            liveLocationMessage: {
                title: "WH MODS DEV",
                h: wm,
                jpegThumbnail: jpegThumbBuffer || undefined
            }
        }
    }

    global.ftoko = {
        key: {
            fromMe: false,
            participant: `0@s.whatsapp.net`,
            ...(m.chat ? {
                remoteJid: "6282127487538@s.whatsapp.net"
            } : {})
        },
        message: {
            productMessage: {
                product: {
                    productImage: {
                        mimetype: "image/jpeg",
                        jpegThumbnail: jpegThumbBuffer || undefined
                    },
                    title: wm,
                    description: "Simple Bot Esm",
                    currencyCode: "USD",
                    priceAmount1000: "20000000",
                    retailerId: "Ghost",
                    productImageCount: 1
                },
                businessOwnerJid: `0@s.whatsapp.net`
            }
        }
    }

    global.fdocs = {
        key: {
            participant: '0@s.whatsapp.net'
        },
        message: {
            documentMessage: {
                title: wm,
                jpegThumbnail: jpegThumbBuffer || undefined
            }
        }
    }

    global.fgclink = {
        key: {
            fromMe: false,
            participant: "0@s.whatsapp.net",
            remoteJid: "0@s.whatsapp.net"
        },
        message: {
            groupInviteMessage: {
                groupJid: "6282127487538-1625305606@g.us",
                inviteCode: "null",
                groupName: "Kawan WH MODS DEV",
                caption: wm,
                jpegThumbnail: jpegThumbBuffer || undefined
            }
        }
    }

    global.fgif = {
        key: {
            fromMe: false,
            participant: `0@s.whatsapp.net`,
            ...(m.chat ? {
                remoteJid: "6282127487538-1625305606@g.us"
            } : {})
        },
        message: {
            videoMessage: {
                title: wm,
                h: `Hmm`,
                seconds: '999999999',
                gifPlayback: 'true',
                caption: wm,
                jpegThumbnail: jpegThumbBuffer || undefined
            }
        }
    }
}

export default handler

function ucapan() {
    const time = moment.tz('Asia/Jakarta').format('HH')
    let res = "Selamat malam 🌙"
    if (time >= 4) res = "Selamat pagi 🌄"
    if (time > 10) res = "Selamat siang ☀️"
    if (time >= 15) res = "Selamat sore 🌅"
    if (time >= 18) res = "Selamat malam 🌙"
    return res
}

function pickRandom(list) {
    return list[Math.floor(list.length * Math.random())]
}