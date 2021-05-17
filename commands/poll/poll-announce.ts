import { Command } from "../../handlers/command";
import { Bot } from "../../bot";
import {GuildChannel, Message, TextChannel} from "discord.js";

import { lRole, emojis } from "../../guild.json";
import { startPoll } from "../../poll/poll-utils";

export = class PollAnnounceCommand extends Command {

    aliases: string[] = ["poll-announce"];
    roles: string[] = [lRole];

    async handle(bot: Bot, message: Message, args: string[]) {
        if(args.length >= 1) {
            const poll = bot.polls.all().find(poll => poll.id === args[0]);
            if(poll !== undefined) {
                let channel: GuildChannel = null;
                if(args.length > 1) {
                    channel = bot.guild.channels.cache.find(c => c.name.toLowerCase() === args.slice(1).join(" ").toLowerCase());
                    if(channel) {
                        poll.channelId = channel.id;
                        startPoll(bot, poll);
                        return;
                    }
                }
            }
        }
        message.react(`<:${emojis.error}>`).then();
    }

}