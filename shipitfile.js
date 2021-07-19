module.exports = shipit => {
    // Load shipit-deploy tasks
    require('shipit-deploy')(shipit)

    shipit.initConfig({
        default: {
            deployTo: '/home/opc/shipit',
            repositoryUrl: 'https://github.com/Matt-Mcl/DiscordBotJS.git',
            key: '/home/opc/sshkey.key',
        },
        staging: {
            servers: 'opc@152.67.150.176',
        },
    })

    shipit.blTask('pm2-setup', async () => {

        // Eliminate potential previous demons 
        await shipit.remote(`pm2 delete -s shipitbot || :`);

        // Launch the npm package installation of the present deployment directory
        await shipit.remote(`cd ${shipit.currentPath} && npm i`);

        // Start the demon through pm2
        await shipit.remote(
            `pm2 start ${shipit.currentPath}/ecosystem.config.js`
        );

    });

    shipit.on('deployed', async () => {
        shipit.start('pm2-setup');
    });
}

