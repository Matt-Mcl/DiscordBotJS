const fetch = require('node-fetch');

module.exports = {
    name: 'csgo',
    group: 'general',
    description: '```.csgo [SteamID/VanityID] \nGets basic csgo stats for provided SteamID\nVanity IDs can be used```',
    async execute(msg, args) {
        if (args.length === 0) return msg.channel.send('Please provide a SteamID');

        // Checks for VanityID
        const getSteamID = await fetch(`http://api.steampowered.com/ISteamUser/ResolveVanityURL/v0001/?key=${process.env.STEAMAPIKEY}&vanityurl=${args[0]}`);
        const steamIDText = await getSteamID.text();
        let steamID = JSON.parse(steamIDText)['response']['steamid'];

        // If no vanity ID is returned use base user input
        if (!steamID) steamID = args[0];

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