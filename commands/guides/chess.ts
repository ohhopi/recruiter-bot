import { Command } from "../../handlers/command";
import { Bot } from "../../bot";
import { Message } from "discord.js";

export = class ChessCommand extends Command {

    aliases: string[] = ["chess"];
    roles: string[] = null;

    handle(bot: Bot, message: Message, args: string[]) {
        message.channel.send("https://drschess.github.io/DrsChess").then();
    }

}