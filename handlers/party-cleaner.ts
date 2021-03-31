import { ITickHandler } from "./handler";
import { Bot } from "../bot";
import { minsUntil, S } from "../utils/time";
import { deleteParty, updatePartyMsg } from "../party/party-utils";
import {TextChannel} from "discord.js";

export class PartyCleaner implements ITickHandler {

    handle(bot: Bot, now: Date) {
        for(let party of bot.parties.all()) {
            let countdown = minsUntil(party.date);
            if(countdown >= (-party.dur.max * S - 1)) {

                if(party.msgId !== null && party.lockouts.length !== 0) {
                    let toOpen = party.lockouts.filter(l => l.dur + minsUntil(l.start) <= 0);
                    for(let lockout of toOpen) {
                        party.allowed.push(...lockout.roles);

                        bot.client.channels.fetch(party.channelId).then((channel: TextChannel) => {
                            let pings = bot.guild.roles.cache.array().filter(r => lockout.roles.includes(r.name.toLowerCase()));
                            let ping = pings.map(r => `${r}`).join(" ");
                            channel.send(ping).then(msg => { msg.delete().then(); });
                        });
                    }
                    party.lockouts = party.lockouts.filter(l => !toOpen.includes(l));
                }

                updatePartyMsg(bot, party);
            } else if(countdown < (-12 * S)) {
                deleteParty(bot, party);
            }
        }

        bot.parties.persist();
    }

}