import { Command } from "../../handlers/command";
import { Bot } from "../../bot";
import { Message } from "discord.js";
import { updatePartyMsg } from "../../party/party-utils";

import { lRole, emojis } from "../../guild.json";
import {isDur} from "../../utils/dm";

export = class DurationCommand extends Command {

    aliases: string[] = ["duration"];
    roles: string[] = [lRole];

    async handle(bot: Bot, message: Message, args: string[]) {
        if(args.length >= 1) {
            const party = bot.parties.all().find(party => party.id === args[0]);
            if(party !== undefined) {
                if(args.length > 1) {
                    if(isDur(args.slice(1).join(" "))) {
                        party.dur = { min: parseInt(args[1], 10), max: parseInt(args[2], 10) };
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