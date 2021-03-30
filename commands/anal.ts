import { Command } from "../handlers/command";
import { Bot } from "../bot";
import {GuildChannel, Message, Role, TextChannel} from "discord.js";
import Table from "easy-table";

import { emojis } from "../guild.json"

export = class AnalCommand extends Command {

    aliases: string[] = ["anal"];
    roles: string[] = null;

    async handle(bot: Bot, message: Message, args: string[]) {
        if(args.length > 2) {
            const channel: TextChannel = <TextChannel>bot.guild.channels.cache.find(c => c.name === args[0]);
            if(channel) {
                const msg: Message = await channel.messages.fetch(args[1]);
                if(msg) {
                    let roles: string[] = [];
                    args.slice(2).join(" ").split(",").map(s => s.toLowerCase().trim()).forEach(role => {
                        let r = bot.guild.roles.cache.find(r => r.name.toLowerCase() === role);
                        if(r !== undefined) { roles.push(r.name.toLowerCase()); }
                    });

                    let anals = {};
                    let uniques = { all: new Set() };
                    for(let role of roles) { uniques[role] = new Set(); }

                    let reactions = msg.reactions.cache.array();
                    for(let reaction of reactions) {
                        anals[reaction.emoji.name] = {};
                        for(let role of roles) { anals[reaction.emoji.name][role] = 0; }


                        let users = (await reaction.users.fetch()).array();
                        for(let user of users) {
                            if(user.bot) { continue; }
                            let member = bot.guild.member(user);
                            if(!member) { continue; }
                            member.roles.cache.filter(r => roles.includes(r.name.toLowerCase())).forEach(r => {
                                anals[reaction.emoji.name][r.name.toLowerCase()]++;
                                uniques[r.name.toLowerCase()].add(user.id);
                            });
                            uniques.all.add(user.id);
                        }
                    }

                    let table = new Table();
                    let txt = "";
                    for(let [k1, v1] of Object.entries(anals)) {
                        table.cell("Reaction", `${k1}`);
                        for(let [k2, v2] of Object.entries(v1)) {
                            table.cell(k2, v2);
                        }
                        table.newRow();
                    }

                    let roleUnique = new Set();
                    for(let role of roles) {
                        txt += `${uniques[role].size} Unique Reaction(s) from ${role}\n`;
                        uniques[role].forEach(e => roleUnique.add(e));
                    }
                    txt += `${roleUnique.size} Unique Reaction(s) out of ${uniques.all.size} Total Unique Reaction(s)`;

                    message.channel.send(`\`\`\`\n${table.toString()}\n\`\`\`\n${txt}`).then();
                    return;
                }
            }
        }
        message.react(`<:${emojis.error}>`).then();
    }

}