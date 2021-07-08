var XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;

module.exports = {
    name: 'csgo',
    group: 'general',
    description: '```TODO```',
    async execute(msg, args) {
        let request = new XMLHttpRequest();
        request.open('GET', 'https://api.steampowered.com/ISteamUserStats/GetUserStatsForGame/v0002/?appid=730&key=//TODO&steamid=//TODO');
        request.send();

        let response = null;

        request.onload = () => {
            response = JSON.parse(request.responseText);

            let kills = response['playerstats']['stats'][0]['value'];
            let deaths = response['playerstats']['stats'][1]['value'];
            let headshots = response['playerstats']['stats'][25]['value'] * 100;

            msg.channel.send(`Kills: ${kills} | Deaths: ${deaths} | K/D Ratio: ${+((kills / deaths).toFixed(2))} | Headshot%: ${+((headshots / kills).toFixed(2))}`);
        }
    },
};