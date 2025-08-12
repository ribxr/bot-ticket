import { createCommand } from "#base";
import { ApplicationCommandType } from "discord.js";

export default createCommand({
    name: "ticket",
    description: "Main command of the ticket system.",
    type: ApplicationCommandType.ChatInput,
    defaultMemberPermissions: "Administrator"
});