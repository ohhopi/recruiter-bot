import { MessageEmbed, TextChannel } from "discord.js";
import { Bot } from "../bot";
import { Poll } from "./poll";
import {
    minsUntil,
    S,
    toFormattedCountdownStr,
    toFormattedDateStr,
    toFormattedTimeStr
} from "../utils/time";
import { toMiniNickname } from "../utils/nickname";

import {  } from "../lib.json";
import { poll_emoji } from "../guild.json";
import { createPollReactionHandler } from "./poll-reactions";
import logger from "../logger";
import { getAllIndexes } from "../utils/winner"

export function buildPollEmbed(poll: Poll): MessageEmbed {
    const embed = new MessageEmbed();

    embed.setTitle(poll.title);

    let desc = poll.description;
    let countdown = minsUntil(poll.date);

    embed.setDescription(desc);
    embed.addField("Time Left", (countdown > 0 ) ? `${toFormattedCountdownStr(countdown)}\n` : "Finished")
    embed.addField("End Date", toFormattedDateStr(poll.date), true);
    embed.addField("End Time", `${toFormattedTimeStr(poll.date)} ST`, true);
    embed.addField("Answers", `${poll.voters.length}`, true);
    let answserCount = []
    poll.answers.forEach((answer, index) => {
        let voted = 0;
        let members = "";
        poll.voters.filter(voter => voter.answer === answer).forEach(member => {
            members += `${toMiniNickname(member.name)}\n`;
            ++voted;
        });
        if(voted === 0) { members = "Empty"; }
        let title = `${poll_emoji[index.toString()]} ${answer.toUpperCase()} (${voted})`;
        answserCount.push(voted)
        embed.addField(title, members, true);
    });
    let winner = ""
    getAllIndexes(answserCount, Math.max(...answserCount)).forEach(windex => {
        winner += poll.answers[windex] + ", "
    });
    winner = winner.substring(0, winner.length - 2);
    if(poll.voters.length <= 0) winner = "None"
    

    embed.setColor("GREEN");
    let footer = "";

    
    if(countdown > 0) {
        embed.addField("Current Winner : ",`**${winner}**`);
        footer += `Open to: ${poll.allowed.length !== 0 ? poll.allowed.join(", ") : "Nobody"}\n`;

        if(poll.lockouts !== undefined && poll.lockouts.length !== 0) {
            for(let lockout of poll.lockouts) {
                let countdown = lockout.start !== null ? minsUntil(lockout.start) : 0;
                footer += `Open in ${toFormattedCountdownStr(lockout.dur + countdown)} to: ${lockout.roles.join(", ")}\n`;
            }
        }

        // footer += `Ending in ${toFormattedCountdownStr(countdown)}\n`;
        footer += `Creator: ${poll.creator.name}\n`;
        footer += `ID: ${poll.id}`;
    } else {
        embed.addField("Winner : ",`**${winner}**`);
        embed.setColor("RED");
        footer = "Closed"
        // TODO : Show Winner announce it.
    }

    embed.setFooter(footer);

    return embed;
}

export function updatePollMsg(bot: Bot, poll: Poll) {
    if(poll.channelId === null || poll.msgId === null) { return; }
    bot.client.channels.fetch(poll.channelId).then((channel: TextChannel) => {
        channel.messages.fetch(poll.msgId).then(message => {
            message.edit("", buildPollEmbed(poll)).then();
        })
    });
}

export function deletePoll(bot: Bot, poll: Poll) {
    bot.polls.delete(poll);
    if(poll.msgId !== null) {
        bot.client.channels.fetch(poll.channelId).then((channel: TextChannel) => {
            channel.messages.fetch(poll.msgId).then(message => {
                message.delete().then();
            })
        });
    }
}

export function kickFromPoll(poll: Poll, name: string): boolean {
    let member = poll.voters.find(m => {
        if(toMiniNickname(m.name.toLowerCase()).includes(name.toLowerCase())) { return true; }
        return m.name.toLowerCase().includes(name.toLowerCase());
    });
    if(member) {
        poll.voters = poll.voters.filter(m => m.id !== member.id);
        return true;
    }
    return false;
}

export function startPoll(bot: Bot, poll: Poll) {
    if(poll.msgId !== null) { return; }
    bot.client.channels.fetch(poll.channelId).then((channel: TextChannel) => {

        let pings = bot.guild.roles.cache.array().filter(r => poll.allowed.includes(r.name.toLowerCase()));
        let ping = pings.map(r => `${r}`).join(" ");
        channel.send(ping).then(async message => {
            poll.msgId = message.id;

            let now = new Date();
            poll.lockouts.forEach(l => l.start = now);

            await message.edit("", buildPollEmbed(poll)).then();

            poll.answers.forEach(async (answer, index) => {
                if(poll.answers.length > 0) { 
                    await message.react(poll_emoji[index.toString()]).then(); 
                }
            })
            
            createPollReactionHandler(bot, poll);
        })
    })
}