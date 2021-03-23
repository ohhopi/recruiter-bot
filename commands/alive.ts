import { Command } from "../handlers/command";
import { Bot } from "../bot";
import { Message } from "discord.js";

import { emojis } from "../guild.json"

export = class AliveCommand extends Command {

    aliases: string[] = ["alive"];
    roles: string[] = [];

    handle(bot: Bot, message: Message, args: string[]) {
        message.react(`<:${emojis.confirm}>`).then();
    }

}