import { Command } from "../../handlers/command";
import { Bot } from "../../bot";
import {GuildChannel, Message, TextChannel} from "discord.js";

import { lRole, emojis } from "../../guild.json";
import {startParty} from "../../party/party-utils";

export = class PartyAnnounceCommand extends Command {

    aliases: string[] = ["party-announce"];
    roles: string[] = [lRole];

    async handle(bot: Bot, message: Message, args: string[]) {
        if(args.length >= 1) {
            const party = bot.parties.all().find(party => party.id === args[0]);
            if(party !== undefined) {
                let channel: GuildChannel = null;
                if(args.length > 1) {
                    channel = bot.guild.channels.cache.find(c => c.name.toLowerCase() === args.slice(1).join(" ").toLowerCase());
                    if(channel) {
                        party.channelId = channel.id;
                        startParty(bot, party);
                        return;
                    }
                }
            }
        }
        message.react(`<:${emojis.error}>`).then();
    }

}