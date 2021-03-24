import { Command } from "../../handlers/command";
import { Bot } from "../../bot";
import { Message } from "discord.js";

export = class FragmentsCommand extends Command {

    aliases: string[] = ["fragments"];
    roles: string[] = null;

    handle(bot: Bot, message: Message, args: string[]) {
        message.channel.send("https://imgur.com/m0kj1mf").then();
    }

}