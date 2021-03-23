import { Command } from "../handlers/command";
import { Bot } from "../bot";
import {GuildChannel, Message, Role, TextChannel} from "discord.js";

import { emojis } from "../guild.json"

export = class ReactionsCommand extends Command {

    aliases: string[] = ["reactions"];
    roles: string[] = [];

    async handle(bot: Bot, message: Message, args: string[]) {
        if(args.length == 2) {
            const channel: TextChannel = <TextChannel>bot.guild.channels.cache.find(c => c.name === args[0]);
            if(channel) {
                const msg: Message = await channel.messages.fetch(args[1]);
                if(msg) {
                    let uniques = new Set();

                    let reactions = msg.reactions.cache.array();
                    for(let reaction of reactions) {
                        let users = (await reaction.users.fetch()).array();
                        for(let user of users) { uniques.add(user.id); }
                    }

                    message.channel.send(`${uniques.size} Unique Reaction(s)`).then();
                    return;
                }
            }
        }
        message.react(`<:${emojis.error}>`).then();
    }

}