import { ITickHandler } from "./handler";
import { Bot } from "../bot";
import { minsBetween, toFormattedTimeStr } from "../utils/time";
import { TextChannel } from "discord.js";
import { startParty } from "../party/party-utils";
import { Schedule } from "../party/schedule";

export class Scheduler implements ITickHandler {

    handle(bot: Bot, now: Date) {
        for(let schedule of bot.schedules.all()) {
            let countdown = minsBetween(schedule.date, now);
            let party = bot.parties.all().find(p => p.id === schedule.id);

            if(schedule.msgId === null && countdown <= 20) {
                bot.client.channels.fetch(schedule.channelId).then((channel: TextChannel) => {
                    let roles = bot.guild.roles.cache.array().filter(r => party.allowed.includes(r.name.toLowerCase()));
                    let ping = roles.map(r => `${r}`).join(" ");

                    ping += `\n"${party.title}" party announcement at ${toFormattedTimeStr(schedule.date)}, roughly in ${countdown} minutes from now`;
                    channel.send(ping).then(message => {
                       schedule.msgId = message.id;
                    });
                });
            }

            if(countdown <= 0) {
                bot.schedules.delete(schedule);
                if(schedule.msgId !== null) {
                    bot.client.channels.fetch(schedule.channelId).then((channel: TextChannel) => {
                        channel.messages.fetch(schedule.msgId).then(message => {
                            message.delete().then();
                        })
                    });
                }

                party.channelId = schedule.channelId;
                startParty(bot, party);
            }
        }

        bot.schedules.persist();
    }

}