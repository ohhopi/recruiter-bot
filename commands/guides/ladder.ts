import { Command } from "../../handlers/command";
import { Bot } from "../../bot";
import { Message } from "discord.js";

export = class LadderCommand extends Command {

    aliases: string[] = ["ladder", "ladders"];
    roles: string[] = null;

    handle(bot: Bot, message: Message, args: string[]) {
        message.channel.send("https://imgur.com/4SrafwA").then();
    }

}