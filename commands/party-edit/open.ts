import { Command } from "../../handlers/command";
import { Bot } from "../../bot";
import { Message } from "discord.js";
import { updatePartyMsg } from "../../party/party-utils";

import { lRole, emojis } from "../../guild.json";
import {isGuildRole} from "../../utils/dm";

export = class OpenCommand extends Command {

    aliases: string[] = ["open"];
    roles: string[] = [lRole];

    async handle(bot: Bot, message: Message, args: string[]) {
        if(args.length >= 1) {
            const party = bot.parties.all().find(party => party.id === args[0]);
            if(party !== undefined) {
                if(args.length > 1) {
                    let roles = args.slice(1).join(" ").split(",").map(r => r.toLowerCase().trim());

                    let valid = true;
                    for(let role of roles) { if(!isGuildRole(bot)(role)) { valid = false; } }

                    if(valid) {
                        for(let role of roles) {
                            if(!party.allowed.includes(role)) { party.allowed.push(role); }
                        }
                        updatePartyMsg(bot, party);
                        message.react(`<:${emojis.confirm}>`).then();
                        return;
                    }
                }
            }
        }
        message.react(`<:${emojis.error}>`).then();
    }

}