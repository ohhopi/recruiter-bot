import { Command } from "../../handlers/command";
import { Bot } from "../../bot";
import { Message } from "discord.js";

export = class ChessCommand extends Command {

    aliases: string[] = ["chess"];
    roles: string[] = null;

    handle(bot: Bot, message: Message, args: string[]) {
        message.channel.send("Minigame Link: https://drschess.github.io/DrsChess").then();
        message.channel.send("I used to suck at Queen Chess but after this video? I discovered I was just retarded\nhttps://www.youtube.com/watch?v=R00R_E2UtR0").then();
    }

}