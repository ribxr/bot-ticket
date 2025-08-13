import { ApplicationCommandOptionType } from "discord.js";
import command from "./command.js";
import { QuickDB } from "quick.db";
import { createEmbed } from "@magicyan/discord";

export default command.subcommand({
    name: "ban",
    description: "Bans a user from creating tickets.",
    options: [
        {
            name: "member",
            description: "Member to ban from the ticket system.",
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
                    description: "> You cannot ban yourself from tickets.",
                    image: "https://r2.e-z.host/2082d908-7c65-4fc3-b02a-5f50f9141543/sg73dtqft9kp9yaosi.png"

                })],
                ephemeral: true,
            });
            return;
        }

        const key = `ticketBans_${interaction.guild.id}`;
        const bannedUsers = (await db.get(key)) || [];

        if (bannedUsers.includes(member.id)) {
            interaction.reply({
                embeds: [createEmbed({
                    color: constants.colors.warning,
                    author: { name: "Warning" },
                    description: `> <@${member.id}> is already banned from creating tickets.`,
                })],
                ephemeral: true,
            });
            return;
        }

        bannedUsers.push(member.id);
        await db.set(key, bannedUsers);

        await interaction.reply({
            embeds: [createEmbed({
                color: constants.colors.success,
                author: { name: "User Banned", iconURL: "https://r2.e-z.host/2082d908-7c65-4fc3-b02a-5f50f9141543/l846ej7gdirjlolpoz.gif" },
                description: `> <@${member.id}> has been banned from creating tickets.`,
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
                        color: constants.colors.danger,
                        author: { name: "Ticket Ban" },
                        description: [
                            `> **Banned User:** <@${member.id}> (\`${member.id}\`)`,
                            `> **Banned By:** <@${interaction.user.id}> (\`${interaction.user.id}\`)`,
                            `> **Date:** <t:${Math.floor(Date.now() / 1000)}:F>`
                        ].join("\n"),
                        image: "https://r2.e-z.host/2082d908-7c65-4fc3-b02a-5f50f9141543/sg73dtqft9kp9yaosi.png"

                    })]
                });
            }
        }

        return;
    },
});