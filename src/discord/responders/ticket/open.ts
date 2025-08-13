import { createResponder, ResponderType } from "#base";
import { QuickDB } from "quick.db";
import {
  TextInputStyle,
  ChannelType,
  ThreadAutoArchiveDuration,
  userMention,
  roleMention,
  ButtonBuilder,
  ButtonStyle,
} from "discord.js";
import { createModalFields, createEmbed, createRow } from "@magicyan/discord";

const db = new QuickDB();

createResponder({
  customId: "ticket/open",
  types: [ResponderType.Button],
  cache: "cached",
  async run(interaction) {
    const guildConfig = await db.get(`ticketConfig_${interaction.guild.id}`);

    if (!guildConfig) {
      await interaction.reply({
        embeds: [
          createEmbed({
            color: constants.colors.danger,
            author: { name: "Error :(", iconURL: "https://r2.e-z.host/2082d908-7c65-4fc3-b02a-5f50f9141543/4hv2o0w6odfqsc4jr5.gif", },
            description: "> Ticket system is not configured on this server.",
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
    if (bannedUsers.includes(interaction.user.id)) {
      await interaction.reply({
        embeds: [
          createEmbed({
            color: constants.colors.danger,
            author: { name: "Error :(", iconURL: "https://r2.e-z.host/2082d908-7c65-4fc3-b02a-5f50f9141543/4hv2o0w6odfqsc4jr5.gif", },
            description: "> You are banned from creating tickets.",
            image:
              "https://r2.e-z.host/2082d908-7c65-4fc3-b02a-5f50f9141543/sg73dtqft9kp9yaosi.png",
          }),
        ],
        flags: ["Ephemeral"],
      });
      return;
    }

    const parentChannel = interaction.guild.channels.cache.get(guildConfig.ticketChannelId);
    if (!parentChannel || parentChannel.type !== ChannelType.GuildText) {
      await interaction.reply({
        embeds: [
          createEmbed({
            color: constants.colors.danger,
            author: { name: "Error :(", iconURL: "https://r2.e-z.host/2082d908-7c65-4fc3-b02a-5f50f9141543/4hv2o0w6odfqsc4jr5.gif", },
            description: "> The ticket channel is not configured properly.",
            image:
              "https://r2.e-z.host/2082d908-7c65-4fc3-b02a-5f50f9141543/sg73dtqft9kp9yaosi.png",
          }),
        ],
        flags: ["Ephemeral"],
      });
      return;
    }

    const existingThread = parentChannel.threads.cache.find(
      (t) =>
        t.ownerId === interaction.user.id &&
        t.name === `ticket-${interaction.user.username.toLowerCase()}`
    );

    if (existingThread) {
      const button = new ButtonBuilder()
        .setLabel("Go to your open ticket")
        .setStyle(ButtonStyle.Link)
        .setURL(`https://discord.com/channels/${interaction.guild.id}/${existingThread.id}`);

      await interaction.reply({
        embeds: [
          createEmbed({
            color: constants.colors.danger,
            author: { name: "Error :(", iconURL: "https://r2.e-z.host/2082d908-7c65-4fc3-b02a-5f50f9141543/4hv2o0w6odfqsc4jr5.gif", },
            description: "> You already have an open ticket.",
            image:
              "https://r2.e-z.host/2082d908-7c65-4fc3-b02a-5f50f9141543/sg73dtqft9kp9yaosi.png",
          }),
        ],
        components: [createRow(button)],
        flags: ["Ephemeral"],
      });
      return;
    }

    const modalMessage = guildConfig.modalMessage || "What is your issue?";

    await interaction.showModal({
      customId: "ticket/open/modal",
      title: interaction.guild.name,
      components: createModalFields({
        issue: {
          label: modalMessage,
          style: TextInputStyle.Paragraph,
          required: true,
          minLength: 10,
          maxLength: 600,
        },
      }),
    });
  },
});

createResponder({
  customId: "ticket/open/modal",
  types: [ResponderType.ModalComponent],
  cache: "cached",
  async run(interaction) {
    const guildConfig = await db.get(`ticketConfig_${interaction.guild.id}`);

    if (!guildConfig) {
      await interaction.reply({
        embeds: [
          createEmbed({
            color: constants.colors.danger,
            author: {
              name: "Error :(",
              iconURL:
                "https://r2.e-z.host/2082d908-7c65-4fc3-b02a-5f50f9141543/4hv2o0w6odfqsc4jr5.gif",
            },
            description: "> The ticket system is not configured on this server.",
            image:
              "https://r2.e-z.host/2082d908-7c65-4fc3-b02a-5f50f9141543/sg73dtqft9kp9yaosi.png",
          }),
        ],
        flags: ["Ephemeral"],
      });
      return;
    }

    const issue = interaction.fields.getTextInputValue("issue");

    const parentChannel = interaction.guild.channels.cache.get(guildConfig.ticketChannelId);
    if (!parentChannel || parentChannel.type !== ChannelType.GuildText) {
      await interaction.reply({
        embeds: [
          createEmbed({
            color: constants.colors.danger,
            author: {
              name: "Error :(",
              iconURL:
                "https://r2.e-z.host/2082d908-7c65-4fc3-b02a-5f50f9141543/4hv2o0w6odfqsc4jr5.gif",
            },
            description: "> The ticket channel is not configured properly.",
            image:
              "https://r2.e-z.host/2082d908-7c65-4fc3-b02a-5f50f9141543/sg73dtqft9kp9yaosi.png",
          }),
        ],
        flags: ["Ephemeral"],
      });
      return;
    }

    const thread = await parentChannel.threads.create({
      name: `ticket-${interaction.user.username.toLowerCase()}`.replace(/[^a-z0-9-]/g, ""),
      autoArchiveDuration: ThreadAutoArchiveDuration.OneDay,
      type: 12,
      invitable: false,
      reason: `Ticket opened by ${interaction.user.tag}`,
    });

    await thread.members.add(interaction.user.id);
    if (guildConfig.roleId) {
      const staffRole = interaction.guild.roles.cache.get(guildConfig.roleId);
      if (staffRole) {
        await thread.members.add(staffRole.id).catch(() => null);
      }
    }

    const mentions = [userMention(interaction.user.id)];
    if (guildConfig.pingsEnabled && guildConfig.roleId) {
      mentions.push(roleMention(guildConfig.roleId));
    }

    const closeButton = new ButtonBuilder()
      .setCustomId(`ticket/close`)
      .setLabel("Close")
      .setStyle(ButtonStyle.Danger);

    const banButton = new ButtonBuilder()
      .setCustomId(`ticket/ban/${interaction.user.id}`)
      .setLabel("Ticket Ban & Close")
      .setStyle(ButtonStyle.Secondary);

    await thread.send({
      content: mentions.join(" "),
      embeds: [
        createEmbed({
          color: constants.colors.primary,
          title: `Ticket created by ${interaction.user.username}`,
          description: `**Issue:**\n${issue}`,
          footer: {
            text: `Ticket ID: ${thread.id}`,
            iconURL: interaction.user.avatarURL() ?? undefined,
          },
          timestamp: new Date(),
        }),
      ],
      components: [createRow(closeButton, banButton)],
    });

    if (guildConfig.logChannelId) {
      const logChannel = interaction.guild.channels.cache.get(guildConfig.logChannelId);
      if (logChannel && logChannel.isTextBased()) {
        logChannel.send({
          embeds: [
            createEmbed({
              color: constants.colors.primary,
              title: "Ticket Created",
              description: `User ${interaction.user.tag} (${interaction.user.id}) criou um ticket.`,
              fields: [
                { name: "Ticket ID", value: thread.id, inline: true },
                { name: "Issue", value: issue.length > 1024 ? issue.slice(0, 1021) + "..." : issue },
                { name: "Ticket Channel", value: `${thread}`, inline: true },
              ],
              image: "https://r2.e-z.host/2082d908-7c65-4fc3-b02a-5f50f9141543/v6zop3p2sb32fidi77.png",
              timestamp: new Date(),
            }),
          ],
        }).catch(() => null);
      }
    }

    const button = new ButtonBuilder()
      .setLabel("Go to your ticket")
      .setStyle(ButtonStyle.Link)
      .setURL(`https://discord.com/channels/${interaction.guild.id}/${thread.id}`);

    await interaction.reply({
      embeds: [
        createEmbed({
          color: constants.colors.success,
          author: {
            name: "Ticket created successfully!",
            iconURL:
              "https://r2.e-z.host/2082d908-7c65-4fc3-b02a-5f50f9141543/l846ej7gdirjlolpoz.gif",
          },
          description: `Your ticket has been created.`,
          image: "https://r2.e-z.host/2082d908-7c65-4fc3-b02a-5f50f9141543/2xrv1bygp6s7poen1b.png",
          footer: {
            text: `We're here to help you!`,
            iconURL: interaction.client.user.avatarURL() ?? undefined,
          },
          timestamp: new Date(),
        }),
      ],
      components: [createRow(button)],
      flags: ["Ephemeral"],
    });
  },
});