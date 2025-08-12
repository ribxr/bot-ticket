import { ApplicationCommandOptionType, ButtonBuilder, ButtonStyle, ChannelType } from "discord.js";
import command from "./command.js";
import { QuickDB } from "quick.db";
import { createEmbed, createRow } from "@magicyan/discord";

export default command.subcommand({
  name: "setup",
  description: "Configures the ticket system settings.",
  options: [
    {
      name: "category",
      description: "Category where tickets will be created.",
      type: ApplicationCommandOptionType.Channel,
      channelTypes: [ChannelType.GuildCategory],
      required: true,
    },
    {
      name: "role",
      description: "Role assigned to ticket staff members.",
      type: ApplicationCommandOptionType.Role,
      required: true,
    },
    {
      name: "ticket_channel",
      description: "Channel where the ticket creation message is sent.",
      type: ApplicationCommandOptionType.Channel,
      channelTypes: [ChannelType.GuildText],
      required: true,
    },
    {
      name: "staff_channel",
      description: "Channel where ticket logs and transcripts are sent.",
      type: ApplicationCommandOptionType.Channel,
      channelTypes: [ChannelType.GuildText],
      required: true,
    },
    {
      name: "pings",
      description: "Whether staff pings are enabled in tickets.",
      type: ApplicationCommandOptionType.Boolean,
      required: true,
    },
    {
      name: "description",
      description: "Description shown in the ticket creation message.",
      type: ApplicationCommandOptionType.String,
      required: true,
    },
    {
      name: "modal_message",
      description:
        'Message shown to users before opening a ticket, e.g., "What is your issue?"',
      type: ApplicationCommandOptionType.String,
      required: true,
    },
  ],

  async run(interaction) {
    const db = new QuickDB();

    const category = interaction.options.getChannel("category");
    const role = interaction.options.getRole("role");
    const ticketChannel = interaction.options.getChannel("ticket_channel");
    const staffChannel = interaction.options.getChannel("staff_channel");
    const pings = interaction.options.getBoolean("pings");
    const description = interaction.options.getString("description");
    const modalMessage = interaction.options.getString("modal_message");

    if (!ticketChannel || !ticketChannel.isTextBased()) {
      interaction.reply({
        content: "`❌` The ticket channel is invalid or not a text channel.",
        ephemeral: true,
      });

      return;
    }

    const guildKey = `ticketConfig_${interaction.guild.id}`;

    await db.set(guildKey, {
      categoryId: category?.id,
      roleId: role?.id,
      ticketChannelId: ticketChannel.id,
      staffChannelId: staffChannel?.id,
      pingsEnabled: pings,
      description,
      modalMessage,
    });

    const embed = createEmbed({
        color: constants.colors.primary,
        thumbnail: interaction.guild.iconURL() ?? '',
        title: `${interaction.guild.name} - Tickets`,
        description: `> ${description}`,
        image: "https://r2.e-z.host/2082d908-7c65-4fc3-b02a-5f50f9141543/v6zop3p2sb32fidi77.png",
        footer: {
            text: `Powered by ${interaction.client.user.username}`,
            iconURL: interaction.client.user.avatarURL() ?? '',
        }
    })

    const row = createRow(
        new ButtonBuilder({
            customId: "ticket/open",
            label: "Open Ticket",
            style: ButtonStyle.Primary
        })
    )

    await ticketChannel.send({
        embeds: [embed],
        components: [row]
    });

    await interaction.reply({
      content: "`✅` Ticket system configured successfully!",
      ephemeral: true,
    });
  },
});