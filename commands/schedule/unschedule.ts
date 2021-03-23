import { Command } from "../../handlers/command";
import { Bot } from "../../bot";
import {GuildChannel, Message, TextChannel} from "discord.js";

import { lRole, emojis } from "../../guild.json";
import {startParty, updatePartyMsg} from "../../party/party-utils";
import {askInDm, dm, getDmLock, isChannel} from "../../utils/dm";
import {msgs} from "../../lib.json";
import {isDate, parseDate} from "../../utils/time";
import {Schedule} from "../../party/schedule";

export = class UnscheduleCommand extends Command {

    aliases: string[] = ["unschedule"];
    roles: string[] = [lRole];

    async handle(bot: Bot, message: Message, args: string[]) {
        if(args.length >= 1) {
            const schedule = bot.schedules.all().find(schedule => schedule.id === args[0]);
            if(schedule !== undefined) {
                bot.schedules.delete(schedule);
                message.react(`<:${emojis.confirm}>`).then();
                return;
            }
        }
        message.react(`<:${emojis.error}>`).then();
    }

}