import { 
  ApplicationCommandOptionType, 
  ChannelType,
  channelMention
} from "discord.js";
import command from "./command.js";
import { QuickDB } from "quick.db";
import { createEmbed } from "@magicyan/discord";

export default command.subcommand({
  name: "setup",
  description: "Configures the welcome system.",
  options: [
    {
      name: "welcome_channel",
      description: "The channel where welcome messages will be sent.",
      type: ApplicationCommandOptionType.Channel,
      channelTypes: [ChannelType.GuildText],
      required: true,
    },
    {
      name: "duration",
      description: "How long the welcome message will remain before being deleted.",
      type: ApplicationCommandOptionType.String,
      required: true,
      choices: [
        { name: "3 seconds", value: "3s" },
        { name: "5 seconds", value: "5s" },
        { name: "7 seconds", value: "7s" },
        { name: "1 minute", value: "1m" },
        { name: "2 minutes", value: "2m" },
        { name: "Never delete", value: "never" },
      ]
    },
  ],

  async run(interaction) {
    const db = new QuickDB();

    const welcomeChannel = interaction.options.getChannel("welcome_channel");
    const duration = interaction.options.getString("duration");

    if (!welcomeChannel || !welcomeChannel.isTextBased()) {
      interaction.reply({
        embeds: [createEmbed({
          color: constants.colors.danger,
          author: {
            name: "Error :(",
            iconURL: "https://r2.e-z.host/2082d908-7c65-4fc3-b02a-5f50f9141543/4hv2o0w6odfqsc4jr5.gif"
          },
          description: "> The selected channel is invalid or not a text-based channel.",
          image: "https://r2.e-z.host/2082d908-7c65-4fc3-b02a-5f50f9141543/sg73dtqft9kp9yaosi.png"
        })],
        flags: ["Ephemeral"],
      });
      return;
    }

    await db.set(`welcomeConfig_${interaction.guild.id}`, {
      welcomeChannelId: welcomeChannel.id,
      duration
    });

    interaction.reply({
      embeds: [createEmbed({
        color: constants.colors.success,
        author: {
          name: "Welcome system configured successfully!",
          iconURL: "https://r2.e-z.host/2082d908-7c65-4fc3-b02a-5f50f9141543/l846ej7gdirjlolpoz.gif"
        },
        description: [
          `**Server ID:** \`${interaction.guild.id}\``,
          `**Welcome Channel:** ${channelMention(welcomeChannel.id)}`,
          `**Message Duration:** ${duration}`
        ].join("\n"),
        image: "https://r2.e-z.host/2082d908-7c65-4fc3-b02a-5f50f9141543/2xrv1bygp6s7poen1b.png"
      })],
      flags: ["Ephemeral"]
    });
    return;
  },
});