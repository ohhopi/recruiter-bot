import { MessageEmbed, TextChannel } from "discord.js";
import { Bot } from "../bot";
import { Party } from "./party";
import {
    fixLeadingZero,
    minsUntil,
    S,
    toFormattedCountdownStr,
    toFormattedDateStr,
    toFormattedTimeStr
} from "../utils/time";
import { toMiniNickname } from "../utils/nickname";

import { roles } from "../lib.json";
import { emojis } from "../guild.json";
import { createPartyReactionHandler } from "./party-reactions";

export function buildPartyEmbed(party: Party): MessageEmbed {
    const embed = new MessageEmbed();

    embed.setTitle(party.title);

    let desc = `ID: ${party.id}\n`;
    desc += `Leader: ${party.leader.name}\n`;
    desc += `Co-leader: ${party.coleader !== null ? party.coleader.name : "None"}\n\n${party.description}`;
    embed.setDescription(desc);

    embed.addField("Date", toFormattedDateStr(party.date), true);
    embed.addField("Time", `${toFormattedTimeStr(party.date)} ST`, true);
    embed.addField("Registered", `${party.members.length} / ${party.comp.max}`, true);

    roles.forEach(role => {
        if(party.comp[role] <= 0) { return; }
        let registered = 0;
        let members = "";
        party.members.filter(member => member.role === role).forEach(member => {
            members += `<:${emojis[role]}> ${toMiniNickname(member.name)}\n`;
            ++registered;
        });
        if(registered === 0) { members = "Empty"; }
        let title = `<:${emojis[role]}> ${role.toUpperCase()} (${registered}/${party.comp[role]})`;
        embed.addField(title, members, true);
    });

    embed.setColor("GREEN");
    let footer = "";

    let countdown = minsUntil(party.date);
    if(countdown > 0) {
        footer += `Open to: ${party.allowed.length !== 0 ? party.allowed.join(", ") : "No one apparently"}\n`;
        footer += `Min Duration ${party.dur.min} - Max Duration ${party.dur.max} - `
        footer += `Starting In ${toFormattedCountdownStr(countdown)}`;
    } else if(countdown > -party.dur.max * S) {
        embed.setColor("YELLOW");
        footer = `Has been running for ${toFormattedCountdownStr(-countdown)}`;
    } else {
        embed.setColor("RED");
        footer = "Closed"
    }

    embed.setFooter(footer);

    return embed;
}

export function updatePartyMsg(bot: Bot, party: Party) {
    if(party.channelId === null || party.msgId === null) { return; }
    bot.client.channels.fetch(party.channelId).then((channel: TextChannel) => {
        channel.messages.fetch(party.msgId).then(message => {
            message.edit("", buildPartyEmbed(party)).then();
        })
    });
}

export function deleteParty(bot: Bot, party: Party) {
    bot.parties.delete(party);
    if(party.msgId !== null) {
        bot.client.channels.fetch(party.channelId).then((channel: TextChannel) => {
            channel.messages.fetch(party.msgId).then(message => {
                message.delete().then();
            })
        });
    }
}

export function kickFromParty(party: Party, name: string): boolean {
    let member = party.members.find(m => {
        if(toMiniNickname(m.name.toLowerCase()).includes(name.toLowerCase())) { return true; }
        return m.name.toLowerCase().includes(name.toLowerCase());
    });
    if(member) {
        party.members = party.members.filter(m => m.id !== member.id);
        return true;
    }
    return false;
}

export function startParty(bot: Bot, party: Party) {
    if(party.msgId !== null) { return; }
    bot.client.channels.fetch(party.channelId).then((channel: TextChannel) => {

        let pings = bot.guild.roles.cache.array().filter(r => party.allowed.includes(r.name.toLowerCase()));
        let ping = pings.map(r => `${r}`).join(" ");
        channel.send(ping).then(async message => {
            party.msgId = message.id;
            message.edit("", buildPartyEmbed(party)).then();

            for (const role of roles) {
                if(party.comp[role] > 0) { await message.react(emojis[role]).then(); }
            }
            await message.react(emojis.cancel).then();

            createPartyReactionHandler(bot, party);
        })
    })
}