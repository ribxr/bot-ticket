import { ApplicationCommandOptionType } from "discord.js";
import command from "./command.js";
import { QuickDB } from "quick.db";
import { createEmbed } from "@magicyan/discord";

export default command.subcommand({
    name: "unban",
    description: "Unbans a user from creating tickets.",
    options: [
        {
            name: "member",
            description: "Member to unban from the ticket system.",
            type: ApplicationCommandOptionType.User,
            required: true,
        },
    ],

    async run(interaction) {
        const db = new QuickDB();
        const member = interaction.options.getUser("member");

        if (!member) {
            interaction.reply({
                embeds: [createEmbed({
                    color: constants.colors.danger,
                    author: { name: "Error :(", iconURL: "https://r2.e-z.host/2082d908-7c65-4fc3-b02a-5f50f9141543/4hv2o0w6odfqsc4jr5.gif" },
                    description: "> The specified member could not be found.",
                    image: "https://r2.e-z.host/2082d908-7c65-4fc3-b02a-5f50f9141543/sg73dtqft9kp9yaosi.png"
                })],
                ephemeral: true,
            });
            return;
        }

        if (member.id === interaction.user.id) {
            interaction.reply({
                embeds: [createEmbed({
                    color: constants.colors.danger,
                    author: { name: "Error :(", iconURL: "https://r2.e-z.host/2082d908-7c65-4fc3-b02a-5f50f9141543/4hv2o0w6odfqsc4jr5.gif" },
                    description: "> You cannot unban yourself.",
                    image: "https://r2.e-z.host/2082d908-7c65-4fc3-b02a-5f50f9141543/sg73dtqft9kp9yaosi.png"
                })],
                ephemeral: true,
            });
            return;
        }

        const key = `ticketBans_${interaction.guild.id}`;
        const bannedUsers = (await db.get(key)) as string[] || [];

        if (!bannedUsers.includes(member.id)) {
            interaction.reply({
                embeds: [createEmbed({
                    color: constants.colors.warning,
                    author: { name: "Warning" },
                    description: `> <@${member.id}> is not banned from creating tickets.`,
                })],
                ephemeral: true,
            });
            return;
        }

        const updatedBans = bannedUsers.filter(id => id !== member.id);
        await db.set(key, updatedBans);

        await interaction.reply({
            embeds: [createEmbed({
                color: constants.colors.success,
                author: { name: "User Unbanned", iconURL: "https://r2.e-z.host/2082d908-7c65-4fc3-b02a-5f50f9141543/l846ej7gdirjlolpoz.gif" },
                description: `> <@${member.id}> has been unbanned from creating tickets.`,
                image: "https://r2.e-z.host/2082d908-7c65-4fc3-b02a-5f50f9141543/2xrv1bygp6s7poen1b.png"
            })],
            ephemeral: true,
        });

        const guildConfig = await db.get(`ticketConfig_${interaction.guild.id}`);
        if (guildConfig?.staffChannelId) {
            const staffChannel = interaction.guild.channels.cache.get(guildConfig.staffChannelId);
            if (staffChannel?.isTextBased()) {
                await staffChannel.send({
                    embeds: [createEmbed({
                        color: constants.colors.success,
                        author: { name: "Ticket Unban" },
                        description: [
                            `> **Unbanned User:** <@${member.id}> (\`${member.id}\`)`,
                            `> **Unbanned By:** <@${interaction.user.id}> (\`${interaction.user.id}\`)`,
                            `> **Date:** <t:${Math.floor(Date.now() / 1000)}:F>`
                        ].join("\n"),
                        image: "https://r2.e-z.host/2082d908-7c65-4fc3-b02a-5f50f9141543/2xrv1bygp6s7poen1b.png"
                    })]
                });
            }
        }

        return;
    },
});