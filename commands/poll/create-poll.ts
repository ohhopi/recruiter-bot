import {Command, CommandHandler} from "../../handlers/command";
import { Bot } from "../../bot";
import { Message } from "discord.js";
import { askInDm, getDmLock, isGuildRole } from "../../utils/dm";
import { isDate, isDateOrTime, isTime, parseDate, parseTime as parseDuration } from "../../utils/time";

import { lRole, poll_emoji } from "../../guild.json";
import { msgs } from "../../lib.json";
import { Poll } from "../../poll/poll";
import { buildPollEmbed } from "../../poll/poll-utils";

class PollCommand extends Command {

    aliases: string[] = ["poll"];
    roles: string[] = [lRole];

    async handle(bot: Bot, message: Message, args: string[]) {
        await startPollCreation(bot, message, args);
    }
}

async function startPollCreation(bot: Bot, message: Message, args: string[]) {

    await getDmLock(message.author).runExclusive(async () => {
        try {
            let title = await askInDm(message.author, "Poll Title :");
            let description = await askInDm(message.author, "Poll Description :");
            let fDate = await askInDm(message.author, "Enter date format dd-mm-yyyy hh:mm for ending date or enter a duration in hh:mm format for the poll to start immediately.", isDateOrTime);
            let date = new Date();

            if (isTime(fDate)){
               date = parseDuration(fDate)
            } else {
               date = parseDate(fDate)
            }
            
            let answers = [];
            let stopAskingforAnswers = false;
            while (!stopAskingforAnswers) {
                const answser = await askInDm(message.author, `Enter a possible answer. Enter ***Done*** when finished entering answsers.`);
                (answser ===  "Done") ? stopAskingforAnswers = true : answers.push(answser);
                if (answers.length === Object.keys(poll_emoji).length) stopAskingforAnswers = true
            }

            const poll = new Poll();
            poll.title = title;
            poll.description = description;
            poll.creator = { id: message.author.id, name: bot.guild.member(message.author).displayName };
            poll.answers = answers;
            poll.date = date;
            poll.allowed = (await askInDm(message.author, msgs.askAllowedRoles, isGuildRole(bot))).split(",").map(r => r.toLowerCase().trim());

            bot.polls.upsert(poll);
            message.author.send(poll.id).then();
            message.author.send(buildPollEmbed(poll)).then();

        } catch (e) { }
    });
}

export = PollCommand;