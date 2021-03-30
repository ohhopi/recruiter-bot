import { Command } from "../../handlers/command";
import { Bot } from "../../bot";
import { Message } from "discord.js";
import {kickFromParty, updatePartyMsg} from "../../party/party-utils";

import { lRole, emojis } from "../../guild.json";
import {dm, dmError, isGuildRole} from "../../utils/dm";
import {unregisterFromParty} from "../../party/party-reactions";
import {toMiniNickname} from "../../utils/nickname";

export = class KickCommand extends Command {

    aliases: string[] = ["kick"];
    roles: string[] = [lRole];

    async handle(bot: Bot, message: Message, args: string[]) {
        if(args.length >= 1) {
            const party = bot.parties.all().find(party => party.id === args[0]);
            if(party !== undefined) {
                if(args.length > 1) {
                    let playa = args.slice(1).join(" ").toLowerCase().trim();
                    let gm = bot.guild.members.cache.find(gm => toMiniNickname(gm.displayName).toLowerCase().includes(playa));
                    if(gm) {
                        if(unregisterFromParty(party, gm, false)) {
                            updatePartyMsg(bot, party);
                            message.react(`<:${emojis.confirm}>`).then();
                            return;
                        }
                    }

                }
            }
        }
        message.react(`<:${emojis.error}>`).then();
    }

}