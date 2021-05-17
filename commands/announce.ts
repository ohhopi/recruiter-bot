import { Command } from "../handlers/command";
import { Bot } from "../bot";
import {Message} from "discord.js";
import { lRole, emojis } from "../guild.json";
import path from "path";

export = class AnnounceCommand extends Command {

    aliases: string[] = ["announce"];
    roles: string[] = [lRole];

    async handle(bot: Bot, message: Message, args: string[]) {
        if(args.length >= 1) {
            const party = bot.parties.all().find(party => party.id === args[0]);
            const poll = bot.polls.all().find(poll => poll.id === args[0]);
            if(party !== undefined) {
                const announceCommand = new (await require(path.join(__dirname, "../commands", "/party/party-announce.ts")))(this);
                announceCommand.handle(bot, message, args);
                return;
            } else if (poll !== undefined) {
                const announceCommand = new (await require(path.join(__dirname, "../commands", "/poll/poll-announce.ts")))(this);
                announceCommand.handle(bot, message, args);
                return;
            }
        }
        message.react(`<:${emojis.error}>`).then();
    }

}