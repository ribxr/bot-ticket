import { createCommand } from "#base";
import { createRow } from "@magicyan/discord";
import { ApplicationCommandType, ButtonBuilder, ButtonStyle } from "discord.js";

createCommand({
	name: "ping",
	description: "Check application latency.",
	type: ApplicationCommandType.ChatInput,
	async run(interaction){
		const { client } = interaction;
		const ping = client.ws.ping;

		const row = createRow(
			new ButtonBuilder({ 
				disabled: true,
				customId: `application/latency`,
				label: `~~ ${ping}ms`,
				style: ButtonStyle.Secondary,
			})
		);
		await interaction.reply({
			flags: ["Ephemeral"], 
			content: `### Pong! 🏓`,
			components: [row],
		});
	}
});