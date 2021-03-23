import { Command } from "../handlers/command";
import { Bot } from "../bot";
import { Message } from "discord.js";

import { emojis } from "../guild.json"

export = class PersistCommand extends Command {

    aliases: string[] = ["persist"];
    roles: string[] = [];

    handle(bot: Bot, message: Message, args: string[]) {
        bot.parties.persist();
        bot.schedules.persist();
        message.react(`<:${emojis.confirm}>`).then();
    }

}