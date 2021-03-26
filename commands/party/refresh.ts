import { Command } from "../../handlers/command";
import { Bot } from "../../bot";
import { Message } from "discord.js";

import { emojis } from "../../guild.json";
import { createPartyReactionHandler } from "../../party/party-reactions";
import {updatePartyMsg} from "../../party/party-utils";

export = class RefreshCommand extends Command {

    aliases: string[] = ["refresh"];
    roles: string[] = [];

    handle(bot: Bot, message: Message, args: string[]) {
        if(args.length >= 1) {
            const party = bot.parties.all().find(party => party.id === args[0]);
            if(party !== undefined) {
                updatePartyMsg(bot, party);
                message.react(`<:${emojis.confirm}>`).then();
                return;
            }
        }
        message.react(`<:${emojis.error}>`).then();
    }

}