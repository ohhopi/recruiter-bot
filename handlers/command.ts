import { IMessageHandler } from "./handler";
import { Bot } from "../bot";
import { Message } from "discord.js";

import path from "path";

import { prefix, ownerId } from "../lib.json"
import { lazyDir } from "../utils/lazy";

class CommandHandler implements IMessageHandler {

    commands: Command[] = [];

    constructor() {
        lazyDir(path.join(__dirname, "../commands"), true).forEach(async file => {
            if(file.endsWith(".js") || file.endsWith(".ts")) {
                const command = new (await require(file))(this);
                this.commands.push(command);
            }
        });
    }

    handle(bot: Bot, message: Message) {
        if(!message.content.startsWith(prefix)) { return; }

        const args = message.content.slice(prefix.length).trim().split(/\s+/g);
        const com = args.shift().toLowerCase();

        const command = this.commands.find(command => command.aliases.includes(com));
        if(command) {
            if(command.roles !== null) {
                const member = bot.guild.member(message.author);
                if(message.author.id !== ownerId && !member.hasPermission("ADMINISTRATOR")) {
                    if(!member.roles.cache.some(r => command.roles.includes(r.name.toLowerCase()))) { return; }
                }
            }

            command.handle(bot, message, args);
        }
    }

}

abstract class Command {
    handler: CommandHandler;

    abstract aliases: string[];
    abstract roles: string[];

    constructor(handler: CommandHandler) { this.handler = handler; }

    abstract handle(bot: Bot, message: Message, args: string[]);
}

export { CommandHandler, Command }