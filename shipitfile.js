module.exports = shipit => {
    // Load shipit-deploy tasks
    require('shipit-deploy')(shipit)

    shipit.initConfig({
        default: {
            deployTo: '/var/node/shipit',
            repositoryUrl: 'https://github.com/Matt-Mcl/DiscordBotJS.git',
        },
        staging: {
            servers: 'opc@152.67.150.176',
        },
    })
}
