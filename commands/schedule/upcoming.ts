import { Command } from "../../handlers/command";
import { Bot } from "../../bot";
import {GuildChannel, Message, MessageEmbed, TextChannel} from "discord.js";

import { lRole, emojis } from "../../guild.json";
import {startParty, updatePartyMsg} from "../../party/party-utils";
import {askInDm, dm, getDmLock, isChannel} from "../../utils/dm";
import {msgs} from "../../lib.json";
import {fixLeadingZero, isDate, minsBetween, minsUntil, parseDate, S} from "../../utils/time";
import {Schedule} from "../../party/schedule";

export = class UpcomingCommand extends Command {

    aliases: string[] = ["upcoming"];
    roles: string[] = null;

    async handle(bot: Bot, message: Message, args: string[]) {

        let open = bot.parties.all().filter(p => minsUntil(p.date) > 0 && p.msgId !== null).sort((a, b) =>  minsBetween(a.date, b.date));
        let embed = new MessageEmbed().setColor("GREEN");
        let str = ""
        open.forEach(p => {
            let hours = fixLeadingZero(Math.trunc(minsUntil(p.date) / S).toString(10));
            let mins = fixLeadingZero((minsUntil(p.date) % S).toString(10));
            str += `Starting in: ${hours}:${mins} - `;
            str += `[${p.title}](https://discord.com/channels/${bot.guild.id}/${p.channelId}/${p.msgId}) - `;
            str += `${p.members.length} / ${p.comp.max}\n`;
        })
        embed.setDescription(str);

        message.channel.send(embed).then();

    }

}