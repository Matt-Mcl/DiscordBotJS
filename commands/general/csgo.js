const fetch = require('node-fetch');

module.exports = {
    name: 'csgo',
    group: 'general',
    description: '```.csgo [SteamID/VanityID] \nGets basic csgo stats for provided SteamID\nVanity IDs can be used```',
    async execute(msg, args) {
        if (args.length === 0) return msg.channel.send('Please provide a SteamID');

        let steamID = args[0];

        // Checks for VanityID, but only if the id doesn't immediately match Steam64
        if (!steamID.match(/[0-9]{17}/)) {
            const getSteamID = await fetch(`http://api.steampowered.com/ISteamUser/ResolveVanityURL/v0001/?key=${process.env.STEAMAPIKEY}&vanityurl=${steamID}`);
            const steamIDText = await getSteamID.text();
            steamID = JSON.parse(steamIDText)['response']['steamid'];
        }

        // Get csgo stats
        const getStats = await fetch(`http://api.steampowered.com/ISteamUserStats/GetUserStatsForGame/v0002/?appid=730&key=${process.env.STEAMAPIKEY}&steamid=${steamID}`);
        const statsText = await getStats.text();

        let stats;
        try {
            stats = JSON.parse(statsText);
        } catch {
            return msg.channel.send('Invalid SteamID');
        }

        const kills = stats['playerstats']['stats'][0]['value'];
        const deaths = stats['playerstats']['stats'][1]['value'];
        const headshots = stats['playerstats']['stats'][25]['value'] * 100;

        msg.channel.send(`Kills: ${kills} | Deaths: ${deaths} | K/D Ratio: ${+((kills / deaths).toFixed(2))} | Headshot%: ${+((headshots / kills).toFixed(2))}`);
    },
};
