import { Command } from "../../handlers/command";
import { Bot } from "../../bot";
import { Message } from "discord.js";
import { updatePartyMsg } from "../../party/party-utils";

import { lRole, emojis } from "../../guild.json";
import {isGuildRole, isPartyRole} from "../../utils/dm";

export = class ReserveCommand extends Command {

    aliases: string[] = ["reserve"];
    roles: string[] = [lRole];

    async handle(bot: Bot, message: Message, args: string[]) {
        if(args.length > 1) {
            const party = bot.parties.all().find(party => party.id === args[0]);
            if(party !== undefined) {
                args.shift();

                let valid = true;
                for(let role of args) { if(!isPartyRole(role)) { valid = false; } }

                if(valid) {
                    for(let role of args) {
                        party.comp.max--;
                        party.comp[role.toLowerCase()]--;
                    }
                    updatePartyMsg(bot, party);
                    message.react(`<:${emojis.confirm}>`).then();
                    return;
                }
            }
        }
        message.react(`<:${emojis.error}>`).then();
    }

}