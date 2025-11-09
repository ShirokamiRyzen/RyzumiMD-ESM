let handler = m => m

handler.before = async function (m) {
    let regionData = {
        '212': '(+212)',
        '265': '(+265)',
        '91': '(+91)',
        '90': '(+90)',
        '1': '(+1)',
    };

    for (let countryCode in regionData) {
        if (m.sender.startsWith(countryCode)) {
            global.db.data.users[m.sender].banned = true
            let bannedCountries = Object.values(regionData).join('\n');
            m.reply(`Sorry, you can't use this bot at this time because your country code has been banned due to spam requests.\n\nBlocked List of Countries:\n${bannedCountries}`);
            return
        }
    }
}

export default handler
