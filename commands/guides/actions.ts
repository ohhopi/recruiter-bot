import { Command } from "../../handlers/command";
import { Bot } from "../../bot";
import { Message } from "discord.js";

export = class ActionsCommand extends Command {

    aliases: string[] = ["actions"];
    roles: string[] = null;

    handle(bot: Bot, message: Message, args: string[]) {
        message.channel.send("https://imgur.com/5oztFPY").then();
    }

}