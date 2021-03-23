import { Command } from "../handlers/command";
import { Bot } from "../bot";
import {GuildChannel, Message, Role, TextChannel} from "discord.js";

import { emojis } from "../guild.json"

export = class AnalCommand extends Command {

    aliases: string[] = ["anal"];
    roles: string[] = [];

    async handle(bot: Bot, message: Message, args: string[]) {
        if(args.length > 2) {
            const channel: TextChannel = <TextChannel>bot.guild.channels.cache.find(c => c.name === args[0]);
            if(channel) {
                const msg: Message = await channel.messages.fetch(args[1]);
                if(msg) {
                    let roles: Role[] = [];
                    args.slice(2).join(" ").split(",").map(s => s.toLowerCase().trim()).forEach(role => {
                        let r = bot.guild.roles.cache.find(r => r.name.toLowerCase() === role);
                        if(r !== undefined) { roles.push(r); }
                    });

                    let anals = {};
                    let uniques = { all: new Set() };
                    for(let role of roles) { uniques[role.name] = new Set(); }

                    let reactions = msg.reactions.cache.array();
                    for(let reaction of reactions) {
                        anals[reaction.emoji.name] = {};
                        for(let role of roles) { anals[reaction.emoji.name][role.name] = 0; }


                        let users = (await reaction.users.fetch()).array();
                        for(let user of users) {
                            bot.guild.member(user).roles.cache.filter(r => roles.includes(r)).forEach(r => {
                                anals[reaction.emoji.name][r.name]++;
                                uniques[r.name].add(user.id);
                            });
                            uniques.all.add(user.id);
                        }
                    }

                    let txt = "";
                    for(let [k1, v1] of Object.entries(anals)) {
                        txt += `**"${k1}" Breakdown**\n`;
                        for(let [k2, v2] of Object.entries(v1)) {
                            txt += `From ${k2}: ${v2}\n`;
                        }
                        txt += "\n";
                    }

                    let roleUnique = new Set();
                    for(let role of roles) {
                        txt += `${uniques[role.name].size} Unique Reaction(s) from ${role.name}\n`;
                        uniques[role.name].forEach(e => roleUnique.add(e));
                    }
                    txt += `${roleUnique.size} Unique Reaction(s) out of ${uniques.all.size} Total Unique Reaction(s)`;

                    message.channel.send(txt).then();
                    return;
                }
            }
        }
        message.react(`<:${emojis.error}>`).then();
    }

}