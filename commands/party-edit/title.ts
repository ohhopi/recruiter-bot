import { Command } from "../../handlers/command";
import { Bot } from "../../bot";
import { Message } from "discord.js";
import { updatePartyMsg } from "../../party/party-utils";

import { lRole, emojis } from "../../guild.json";

export = class TitleCommand extends Command {

    aliases: string[] = ["title"];
    roles: string[] = [lRole];

    async handle(bot: Bot, message: Message, args: string[]) {
        if(args.length >= 1) {
            const party = bot.parties.all().find(party => party.id === args[0]);
            if(party !== undefined) {
                if(args.length > 1) {
                    party.title = args.slice(1).join(" ");
                    updatePartyMsg(bot, party);
                    message.react(`<:${emojis.confirm}>`).then();
                    return;
                }
            }
        }
        message.react(`<:${emojis.error}>`).then();
    }

}