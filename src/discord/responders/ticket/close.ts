import { createResponder, ResponderType } from "#base";
import { createEmbed } from "@magicyan/discord";
import { PermissionsBitField, userMention } from "discord.js";
import { QuickDB } from "quick.db";

const db = new QuickDB();

createResponder({
  customId: "ticket/close",
  types: [ResponderType.Button],
  cache: "cached",
  async run(interaction) {
    const thread = interaction.channel;
    if (!thread || !thread.isThread()) {
      await interaction.reply({
        embeds: [
          createEmbed({
            color: constants.colors.danger,
            author: {
              name: "Error :(",
              iconURL:
                "https://r2.e-z.host/2082d908-7c65-4fc3-b02a-5f50f9141543/4hv2o0w6odfqsc4jr5.gif",
            },
            description: "> This command can only be used inside a ticket thread.",
            image:
              "https://r2.e-z.host/2082d908-7c65-4fc3-b02a-5f50f9141543/sg73dtqft9kp9yaosi.png",
          }),
        ],
        flags: ["Ephemeral"],
      });
      return;
    }

    const guildConfig = await db.get(`ticketConfig_${interaction.guild.id}`);
    if (!guildConfig?.roleId) {
      await interaction.reply({
        embeds: [
          createEmbed({
            color: constants.colors.danger,
            author: {
              name: "Error :(",
              iconURL:
                "https://r2.e-z.host/2082d908-7c65-4fc3-b02a-5f50f9141543/4hv2o0w6odfqsc4jr5.gif",
            },
            description: "> Ticket system is not configured properly.",
            image:
              "https://r2.e-z.host/2082d908-7c65-4fc3-b02a-5f50f9141543/sg73dtqft9kp9yaosi.png",
          }),
        ],
        flags: ["Ephemeral"],
      });
      return;
    }

    const member = await interaction.guild.members.fetch(interaction.user.id);
    const isStaff = member.roles.cache.has(guildConfig.roleId);
    const isAdmin = member.permissions.has(PermissionsBitField.Flags.Administrator);
    if (!isStaff && !isAdmin) {
      await interaction.reply({
        embeds: [
          createEmbed({
            color: constants.colors.danger,
            author: { name: "Access Denied" },
            description:
              "> You need to be staff or have administrator permission to close tickets.",
            image:
              "https://r2.e-z.host/2082d908-7c65-4fc3-b02a-5f50f9141543/sg73dtqft9kp9yaosi.png",
          }),
        ],
        flags: ["Ephemeral"],
      });
      return;
    }

    let ownerUser = null;
    try {
      const prefix = "ticket-";
      if (thread.name.startsWith(prefix)) {
        const usernamePart = thread.name.slice(prefix.length);
        const members = await interaction.guild.members.fetch();
        const found = members.find(
          (m) =>
            m.user.username.toLowerCase() === usernamePart.toLowerCase() ||
            (m.nickname?.toLowerCase() === usernamePart.toLowerCase())
        );
        ownerUser = found?.user || null;
      }
    } catch {
      ownerUser = null;
    }

    if (guildConfig.staffChannelId) {
      const staffChannel = interaction.guild.channels.cache.get(guildConfig.staffChannelId);
      if (staffChannel?.isTextBased()) {
        await staffChannel.send({
          embeds: [
            createEmbed({
              color: constants.colors.primary,
              author: { name: "Ticket Closed" },
              description: [
                `> **Ticket:** ${thread.name} (\`${thread.id}\`)`,
                `> **Owner:** ${
                  ownerUser ? `${ownerUser.tag} (${userMention(ownerUser.id)})` : "Indefinido"
                }`,
                `> **Closed By:** ${userMention(interaction.user.id)} (\`${interaction.user.id}\`)`,
                `> **Date:** <t:${Math.floor(Date.now() / 1000)}:F>`,
              ].join("\n"),
              image:
                "https://r2.e-z.host/2082d908-7c65-4fc3-b02a-5f50f9141543/v6zop3p2sb32fidi77.png",
            }),
          ],
        });
      }
    }

    await interaction.reply({
      embeds: [
        createEmbed({
          color: constants.colors.success,
          author: {
            name: "Ticket Closed",
            iconURL:
              "https://r2.e-z.host/2082d908-7c65-4fc3-b02a-5f50f9141543/l846ej7gdirjlolpoz.gif",
          },
          description: "> Ticket closed successfully.",
          image:
            "https://r2.e-z.host/2082d908-7c65-4fc3-b02a-5f50f9141543/2xrv1bygp6s7poen1b.png",
        }),
      ],
    });

    await thread.setArchived(true, `Ticket closed by ${interaction.user.tag}`);
    await new Promise((resolve) => setTimeout(resolve, 5000));
    await thread.delete("Ticket closed and deleted after log");
  },
});

createResponder({
  customId: "ticket/ban/:userId",
  types: [ResponderType.Button],
  cache: "cached",
  async run(interaction, params) {
    const { userId } = params;

    const guildConfig = await db.get(`ticketConfig_${interaction.guild.id}`);
    if (!guildConfig?.roleId) {
      await interaction.reply({
        embeds: [
          createEmbed({
            color: constants.colors.danger,
            author: {
              name: "Error :(",
              iconURL:
                "https://r2.e-z.host/2082d908-7c65-4fc3-b02a-5f50f9141543/4hv2o0w6odfqsc4jr5.gif",
            },
            description: "> Ticket system is not configured properly.",
            image:
              "https://r2.e-z.host/2082d908-7c65-4fc3-b02a-5f50f9141543/sg73dtqft9kp9yaosi.png",
          }),
        ],
        flags: ["Ephemeral"],
      });
      return;
    }

    const member = await interaction.guild.members.fetch(interaction.user.id);
    const isStaff = member.roles.cache.has(guildConfig.roleId);
    const isAdmin = member.permissions.has(PermissionsBitField.Flags.Administrator);
    if (!isStaff && !isAdmin) {
      await interaction.reply({
        embeds: [
          createEmbed({
            color: constants.colors.danger,
            author: { name: "Access Denied" },
            description:
              "> You need to be staff or have administrator permission to ban users.",
            image:
              "https://r2.e-z.host/2082d908-7c65-4fc3-b02a-5f50f9141543/sg73dtqft9kp9yaosi.png",
          }),
        ],
        flags: ["Ephemeral"],
      });
      return;
    }

    if (interaction.user.id === userId) {
      await interaction.reply({
        embeds: [
          createEmbed({
            color: constants.colors.danger,
            author: { name: "Error :(" },
            description: "> You cannot ban yourself.",
            image:
              "https://r2.e-z.host/2082d908-7c65-4fc3-b02a-5f50f9141543/sg73dtqft9kp9yaosi.png",
          }),
        ],
        flags: ["Ephemeral"],
      });
      return;
    }

    const banKey = `ticketBans_${interaction.guild.id}`;
    const bannedUsers = (await db.get(banKey)) || [];
    if (bannedUsers.includes(userId)) {
      await interaction.reply({
        embeds: [
          createEmbed({
            color: constants.colors.warning,
            author: { name: "Warning" },
            description: `> ${userMention(userId)} is already banned from creating tickets.`,
          }),
        ],
        flags: ["Ephemeral"],
      });
      return;
    }

    let ownerUser = null;
    try {
      const thread = interaction.channel;
      if (thread && thread.isThread()) {
        const prefix = "ticket-";
        if (thread.name.startsWith(prefix)) {
          const usernamePart = thread.name.slice(prefix.length);
          const members = await interaction.guild.members.fetch();
          const found = members.find(
            (m) =>
              m.user.username.toLowerCase() === usernamePart.toLowerCase() ||
              (m.nickname?.toLowerCase() === usernamePart.toLowerCase())
          );
          ownerUser = found?.user || null;
        }
      }
    } catch {
      ownerUser = null;
    }

    bannedUsers.push(userId);
    await db.set(banKey, bannedUsers);

    if (guildConfig.staffChannelId) {
      const staffChannel = interaction.guild.channels.cache.get(guildConfig.staffChannelId);
      if (staffChannel?.isTextBased()) {
        await staffChannel.send({
          embeds: [
            createEmbed({
              color: constants.colors.danger,
              author: { name: "Ticket Ban" },
              description: [
                `> **Banned User:** ${userMention(userId)} (\`${userId}\`)`,
                `> **Banned By:** ${userMention(interaction.user.id)} (\`${interaction.user.id}\`)`,
                `> **Date:** <t:${Math.floor(Date.now() / 1000)}:F>`,
                `> **Ticket Owner:** ${
                  ownerUser ? `${ownerUser.tag} (${userMention(ownerUser.id)})` : "Indefinido"
                }`,
                `> **Ticket:** ${
                  interaction.channel?.isThread() ? interaction.channel.name : "Unknown"
                }`,
              ].join("\n"),
              image:
                "https://r2.e-z.host/2082d908-7c65-4fc3-b02a-5f50f9141543/sg73dtqft9kp9yaosi.png",
            }),
          ],
        });
      }
    }

    await interaction.reply({
      embeds: [
        createEmbed({
          color: constants.colors.success,
          author: {
            name: "User Banned",
            iconURL:
              "https://r2.e-z.host/2082d908-7c65-4fc3-b02a-5f50f9141543/l846ej7gdirjlolpoz.gif",
          },
          description: `> ${userMention(userId)} has been banned from creating tickets.`,
          image:
            "https://r2.e-z.host/2082d908-7c65-4fc3-b02a-5f50f9141543/2xrv1bygp6s7poen1b.png",
        }),
      ],
      flags: ["Ephemeral"],
    });

    if (interaction.channel && interaction.channel.isThread()) {
      await new Promise((resolve) => setTimeout(resolve, 5000));
      await interaction.channel.delete("Ticket thread deleted after ban");
    }
  },
});