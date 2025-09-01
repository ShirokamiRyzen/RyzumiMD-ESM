import { createRequire } from 'module'
import util from 'util'

export const handler = async (m, { conn, text }) => {
  if (!text) {
  await conn.reply(m.chat, "Contoh: .eval return m.key;  |  atau  .eval console.log(m.key)", m)
    return
  }

  const nodeRequire = createRequire(import.meta.url)

  let output = ""
  const originalConsoleLog = console.log
  console.log = (...args) => {
    output += args.map(a =>
      typeof a === "string" ? a : util.inspect(a, { depth: 5, maxArrayLength: 100 })
    ).join(" ") + "\n"
  }

  try {
    const AsyncFunction = Object.getPrototypeOf(async function(){}).constructor
    const fn = new AsyncFunction(
      "m", "conn", "require", "util",
      // biar support await & return; user bebas tulis ekspresi atau statement
      text
    )

    const result = await fn(m, conn, nodeRequire, util)
    if (typeof result !== "undefined") {
      output += `Result: ${
        typeof result === "string" ? result : util.inspect(result, { depth: 5, maxArrayLength: 100 })
      }`
    }
  } catch (e) {
    output += `Error: ${e && e.stack ? e.stack : e}`
  } finally {
    console.log = originalConsoleLog
  }

  await m.reply(output.trim(), false, false, { smlcap: false })
}

handler.command = /^eval|js$/i
handler.owner = true

export default handler
