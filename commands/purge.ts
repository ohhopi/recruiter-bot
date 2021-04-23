import { Command } from "../handlers/command";
import { Bot } from "../bot";
import {GuildChannel, GuildMember, Message, MessageReaction, Role, TextChannel, User} from "discord.js";

import { emojis, gRole } from "../guild.json"
import {askInDm, dm, dmError, getDmLock} from "../utils/dm";

export = class PurgeCommand extends Command {

    aliases: string[] = ["purge"];
    roles: string[] = [gRole];

    async handle(bot: Bot, message: Message, args: string[]) {
        if(args.length > 2) {
            const channel: TextChannel = <TextChannel>bot.guild.channels.cache.find(c => c.name === args[0]);
            if(channel) {
                const msg: Message = await channel.messages.fetch(args[1]);
                if(msg) {

                    let rName = args.slice(2).join(" ").trim().toLowerCase();
                    let roles = await bot.guild.roles.fetch();
                    let role = roles.cache.find(r => r.name.toLowerCase() === rName);

                    let reacted = new Set();
                    let reactions = msg.reactions.cache.array();
                    for(let reaction of reactions) {
                        let users = await getAllMsgReactions(reaction);
                        for(let user of users) { reacted.add(user.id); }
                    }

                    let toPurge = role.members.filter(m => !reacted.has(m.id));

                    await getDmLock(message.author).runExclusive(async () => {
                        try {
                            let confirmation = await askInDm(message.author, `I'll be purging **${toPurge.size}** out of **${role.members.size}** ${role.name}\n\n **Yes** to proceed\nAnything else to cancel`);
                            if(confirmation.toLowerCase() === "yes") {
                                await channel.send("Purge in 3");
                                await new Promise(r => setTimeout(r, 1000));
                                await channel.send("Purge in 2");
                                await new Promise(r => setTimeout(r, 1000));
                                await channel.send("Purge in 1");
                                await new Promise(r => setTimeout(r, 1000));
                                toPurge.forEach(m => m.roles.remove(role));
                                channel.send(`${role} Sickness has been purged!!!`).then();
                            } else {
                                dmError(message.author, "Sickness hasn't been purged...");
                            }
                        } catch (e) { }
                    });

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