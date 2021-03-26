import { Command } from "../../handlers/command";
import { Bot } from "../../bot";
import { Message } from "discord.js";
import { updatePartyMsg} from "../../party/party-utils";
import { registerInParty } from "../../party/party-reactions";

import { lRole, emojis } from "../../guild.json";
import { roles } from "../../lib.json";

export = class AddCommand extends Command {

    aliases: string[] = ["add"];
    roles: string[] = [lRole];

    async handle(bot: Bot, message: Message, args: string[]) {
        if(args.length >= 1) {
            const party = bot.parties.all().find(party => party.id === args[0]);
            if(party !== undefined) {
                if(args.length > 2) {
                    let role = args[1].toLowerCase();
                    if(roles.includes(role)) {
                        let playa = args.slice(2).join(" ").toLowerCase().trim();
                        let gm = bot.guild.members.cache.find(gm => gm.displayName.toLowerCase().includes(playa));
                        if(gm) {
                            if(registerInParty(party, gm, role)) {
                                updatePartyMsg(bot, party);
                                message.react(`<:${emojis.confirm}>`).then();
                                return;
                            }
                        }
                    }
                }
            }
        }
        message.react(`<:${emojis.error}>`).then();
    }

}