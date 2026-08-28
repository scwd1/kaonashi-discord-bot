const { Client, GatewayIntentBits } = require('discord.js');
const fetch = require('node-fetch');
const express = require('express');

// Express Server to satisfy Render Free Tier health check
const app = express();
const PORT = process.env.PORT || 10000;

app.get('/', (req, res) => {
    res.send('Kaonashi Cove Discord Bot is active!');
});

app.listen(PORT, () => {
    console.log(`Web server listening on port ${PORT}`);
});

// Discord Bot Client
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers
    ]
});

client.on('ready', () => {
    console.log(`Bot active and monitoring member updates as ${client.user.tag}`);
});

client.on('guildMemberUpdate', async (oldMember, newMember) => {
    const oldRoles = new Set(oldMember.roles.cache.keys());
    const newRoles = new Set(newMember.roles.cache.keys());

    // Roles added on Discord
    for (const roleId of newRoles) {
        if (!oldRoles.has(roleId)) {
            await notifyForum('add', newMember.id, roleId);
        }
    }

    // Roles removed on Discord
    for (const roleId of oldRoles) {
        if (!newRoles.has(roleId)) {
            await notifyForum('remove', newMember.id, roleId);
        }
    }
});

async function notifyForum(action, discordUserId, discordRoleId) {
    try {
        const response = await fetch('https://kaonashicove.gamer.free/forums/ext/kaonashicove/discordsync/webhook.php', {
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
        const result = await response.text();
        console.log(`Forum Sync (${action}): User ${discordUserId}, Role ${discordRoleId} => Response: ${result}`);
    } catch (err) {
        console.error('Failed to send webhook update to phpBB forum:', err);
    }
}

client.login(process.env.DISCORD_BOT_TOKEN);
