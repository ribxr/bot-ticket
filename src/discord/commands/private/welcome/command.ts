import { createCommand } from "#base";
import { ApplicationCommandType } from "discord.js";

export default createCommand({
    name: "welcome",
    description: "Main command of the welcome system.",
    type: ApplicationCommandType.ChatInput,
    defaultMemberPermissions: "Administrator"
});