import { Command } from "../../handlers/command";
import { Bot } from "../../bot";
import { Message } from "discord.js";

import { lRole, emojis } from "../../guild.json";
import {toMiniNickname} from "../../utils/nickname";
import { registerInPoll } from "../../poll/poll-reactions";
import { updatePollMsg } from "../../poll/poll-utils";

export = class AddPollCommand extends Command {

    aliases: string[] = ["add"];
    roles: string[] = [lRole];

    async handle(bot: Bot, message: Message, args: string[]) {
        if(args.length >= 1) {
            const poll = bot.polls.all().find(poll => poll.id === args[0]);
            if(poll !== undefined) {
                if(args.length > 2) {
                    let answer = args[1].toLowerCase();
                    if(poll.answers.includes(answer)) {
                        let playa = args.slice(2).join(" ").toLowerCase().trim();
                        let gm = bot.guild.members.cache.find(gm => toMiniNickname(gm.displayName).toLowerCase().includes(playa));
                        if(gm) {
                            if(registerInPoll(poll, gm, answer)) {
                                updatePollMsg(bot, poll);
                                message.react(`<:${emojis.confirm}>`).then();
                                return;
                            }
                        }
                    }
                }
            }
        }
        message.react(`<:${emojis.error}>`).then();
    }

}