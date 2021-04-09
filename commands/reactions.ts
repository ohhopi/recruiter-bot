import { Command } from "../handlers/command";
import { Bot } from "../bot";
import {GuildChannel, Message, MessageReaction, Role, TextChannel, User} from "discord.js";

import { emojis } from "../guild.json"

export = class ReactionsCommand extends Command {

    aliases: string[] = ["reactions"];
    roles: string[] = null;

    async handle(bot: Bot, message: Message, args: string[]) {
        if(args.length == 2) {
            const channel: TextChannel = <TextChannel>bot.guild.channels.cache.find(c => c.name === args[0]);
            if(channel) {
                const msg: Message = await channel.messages.fetch(args[1]);
                if(msg) {
                    let uniques = new Set();

                    let reactions = msg.reactions.cache.array();
                    for(let reaction of reactions) {
                        let users = await getAllMsgReactions(reaction);
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

async function getAllMsgReactions(reaction: MessageReaction, startId: string = null): Promise<User[]> {
    let users: User[] = [];
    let req;
    if(startId === null) {
        req = await reaction.users.fetch();
    } else {
        req = await reaction.users.fetch({ after: startId });
    }

    users.push(...req.values());
    if(req.size === 100) {
        users.push(...(await getAllMsgReactions(reaction, users[users.length - 1].id)));
    }

    return users;
}