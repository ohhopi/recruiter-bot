import { Command } from "../../handlers/command";
import { Bot } from "../../bot";
import { Message } from "discord.js";
import { updatePartyMsg } from "../../party/party-utils";
import { askInDm, dm, getDmLock } from "../../utils/dm";

import { lRole } from "../../guild.json";
import { msgs } from "../../lib.json";
import {isDate, parseDate, toFormattedDateStr, toFormattedTimeStr} from "../../utils/time";


export = class DateCommand extends Command {

    aliases: string[] = ["date"];
    roles: string[] = [lRole];

    async handle(bot: Bot, message: Message, args: string[]) {
        if(args.length >= 1) {
            const party = bot.parties.all().find(party => party.id === args[0]);
            if(party !== undefined) {
                await getDmLock(message.author).runExclusive(async () => {
                    try {
                        party.date = parseDate(await askInDm(message.author, msgs.askDate.replace("Event", "Schedule"), isDate));
                        updatePartyMsg(bot, party);
                        dm(message.author, `Date updated to ${toFormattedDateStr(party.date)} ${toFormattedTimeStr(party.date)}`);
                    } catch (e) { }
                });
            }
        }
    }

}