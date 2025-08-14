import { createEvent } from "#base";
import { userMention } from "discord.js";
import { QuickDB } from "quick.db";

createEvent({
    name: "Welcome System",
    event: "guildMemberAdd",

    async run(member) {
        const db = new QuickDB();
        const config = await db.get(`welcomeConfig_${member.guild.id}`);
        if (!config || !config.welcomeChannelId) return;

        const channel = member.guild.channels.cache.get(config.welcomeChannelId);
        if (!channel || !channel.isTextBased()) return;

        let messageTemplate = config.messageTemplate || "Welcome {user} to {guild}!";

        const message = messageTemplate
            .replace(/{user}/g, userMention(member.id))
            .replace(/{user.username}/g, member.user.username)
            .replace(/{guild}/g, member.guild.name);

        const msg = await channel.send({ content: message });

        if (config.duration && config.duration !== "never") {
            let ms = 0;
            switch(config.duration) {
                case "3s": ms = 3000; break;
                case "5s": ms = 5000; break;
                case "7s": ms = 7000; break;
                case "1m": ms = 60000; break;
                case "2m": ms = 120000; break;
            }
            if (ms > 0) setTimeout(() => msg.delete().catch(() => {}), ms);
        }
    }
});