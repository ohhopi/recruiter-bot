import { Command } from "../../handlers/command";
import { Bot } from "../../bot";
import { Message } from "discord.js";
import {deleteParty, updatePartyMsg} from "../../party/party-utils";

import { lRole, emojis } from "../../guild.json";

export = class DeleteCommand extends Command {

    aliases: string[] = ["delete"];
    roles: string[] = [lRole];

    async handle(bot: Bot, message: Message, args: string[]) {
        if(args.length >= 1) {
            const party = bot.parties.all().find(party => party.id === args[0]);
            if(party !== undefined) {
                deleteParty(bot, party);
                message.react(`<:${emojis.confirm}>`).then();
                return;
            }
        }
        message.react(`<:${emojis.error}>`).then();
    }

}