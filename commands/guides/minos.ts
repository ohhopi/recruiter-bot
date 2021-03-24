import { Command } from "../../handlers/command";
import { Bot } from "../../bot";
import { Message } from "discord.js";

export = class KnightReflectCommand extends Command {

    aliases: string[] = ["mino", "minos", "minotaur", "minotaurs"];
    roles: string[] = null;

    handle(bot: Bot, message: Message, args: string[]) {
        message.channel.send("https://imgur.com/MHSeCpy").then();
    }

}