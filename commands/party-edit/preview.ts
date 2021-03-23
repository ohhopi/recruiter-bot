import { Command } from "../../handlers/command";
import { Bot } from "../../bot";
import { Message } from "discord.js";
import { buildPartyEmbed } from "../../party/party-utils";

import { lRole, emojis } from "../../guild.json";


export = class PreviewCommand extends Command {

    aliases: string[] = ["preview"];
    roles: string[] = [lRole];

    async handle(bot: Bot, message: Message, args: string[]) {
        if(args.length >= 1) {
            const party = bot.parties.all().find(party => party.id === args[0]);
            if(party !== undefined) {
                message.channel.send(buildPartyEmbed(party)).then();
                return;
            }
        }
        message.react(`<:${emojis.error}>`).then();
    }

}