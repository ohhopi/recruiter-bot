import { Command } from "../../handlers/command";
import { Bot } from "../../bot";
import { Message } from "discord.js";

export = class CleavesCommand extends Command {

    aliases: string[] = ["cleaves", "cleave"];
    roles: string[] = null;

    handle(bot: Bot, message: Message, args: string[]) {
        message.channel.send("I used to suck at Kate Perry cleaves but after this video? I discovered I'm just directionally challenged\nhttps://www.youtube.com/watch?v=Zj62aLLneus").then();
    }

}