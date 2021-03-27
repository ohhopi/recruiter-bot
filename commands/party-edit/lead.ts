import { Command } from "../../handlers/command";
import { Bot } from "../../bot";
import { Message } from "discord.js";
import { updatePartyMsg } from "../../party/party-utils";

import { lRole, emojis } from "../../guild.json";

export = class LeadCommand extends Command {

    aliases: string[] = ["lead"];
    roles: string[] = [lRole];

    async handle(bot: Bot, message: Message, args: string[]) {
        if(args.length >= 1) {
            const party = bot.parties.all().find(party => party.id === args[0]);
            if(party !== undefined) {
                party.leader = { id: message.author.id, name: bot.guild.member(message.author).displayName }
                updatePartyMsg(bot, party);
                message.react(`<:${emojis.confirm}>`).then();
                return;
            }
        }
        message.react(`<:${emojis.error}>`).then();
    }

}