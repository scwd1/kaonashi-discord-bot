const { Client, GatewayIntentBits } = require('discord.js');
const fetch = require('node-fetch');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers
    ]
});

client.on('ready', () => {
    console.log(`Bot logged in as ${client.user.tag}`);
});

client.on('guildMemberUpdate', async (oldMember, newMember) => {
    const addedRoles = newMember.roles.cache.filter(role => !oldMember.roles.cache.has(role.id));
    const removedRoles = oldMember.roles.cache.filter(role => !oldMember.roles.cache.has(role.id));

    for (const [roleId] of addedRoles) {
        await notifyForum('add', newMember.id, roleId);
    }

    for (const [roleId] of removedRoles) {
        await notifyForum('remove', newMember.id, roleId);
    }
});

async function notifyForum(action, discordUserId, discordRoleId) {
    try {
        await fetch('https://kaonashicove.gamer.free/forums/ext/kaonashicove/discordsync/webhook.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Discord-Secret': 'KaonashiSecretKey123'
            },
            body: JSON.stringify({
                action: action,
                discord_user_id: discordUserId,
                discord_role_id: discordRoleId
            })
        });
    } catch (err) {
        console.error('Failed to sync role update to phpBB forum:', err);
    }
}

client.login(process.env.DISCORD_BOT_TOKEN);
