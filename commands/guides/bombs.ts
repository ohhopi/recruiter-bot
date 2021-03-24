import { Command } from "../../handlers/command";
import { Bot } from "../../bot";
import { Message } from "discord.js";

export = class BombsCommand extends Command {

    aliases: string[] = ["bombs", "bomb"];
    roles: string[] = null;

    handle(bot: Bot, message: Message, args: string[]) {
        message.channel.send("https://imgur.com/Ra54mgj").then();
    }

}