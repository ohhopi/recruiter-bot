import { Command } from "../../handlers/command";
import { Bot } from "../../bot";
import {GuildChannel, Message, TextChannel} from "discord.js";

import { lRole, emojis } from "../../guild.json";
import {startParty, updatePartyMsg} from "../../party/party-utils";
import {askInDm, dm, getDmLock, isChannel} from "../../utils/dm";
import {msgs} from "../../lib.json";
import {isDate, parseDate} from "../../utils/time";
import {Schedule} from "../../party/schedule";

export = class ScheduleCommand extends Command {

    aliases: string[] = ["schedule"];
    roles: string[] = [lRole];

    async handle(bot: Bot, message: Message, args: string[]) {
        if(args.length >= 1) {
            const party = bot.parties.all().find(party => party.id === args[0]);
            if(party !== undefined && party.msgId === null) {
                await getDmLock(message.author).runExclusive(async () => {
                    try {
                        let schedule = new Schedule();
                        let channel = await askInDm(message.author, msgs.askChannel, isChannel(bot));
                        let date = parseDate(await askInDm(message.author, msgs.askDate, isDate));

                        schedule.id = party.id;
                        schedule.channelId = bot.guild.channels.cache.find((c: GuildChannel) => c.name.toLowerCase() === channel.toLowerCase()).id;
                        schedule.date = date;

                        bot.schedules.upsert(schedule);
                        dm(message.author, `Party has been scheduled`);
                    } catch (e) { }
                });

                return;
            }
        }
        message.react(`<:${emojis.error}>`).then();
    }

}