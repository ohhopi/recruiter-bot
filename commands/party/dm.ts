import { Command } from "../../handlers/command";
import { Bot } from "../../bot";
import {Message, MessageEmbed} from "discord.js";

import { lRole } from "../../guild.json";
import { askInDm, dm, getDmLock } from "../../utils/dm";

export = class DmCommand extends Command {

    aliases: string[] = ["dm"];
    roles: string[] = [lRole];

    async handle(bot: Bot, message: Message, args: string[]) {
        if(args.length >= 1) {
            const party = bot.parties.all().find(party => party.id === args[0]);
            if(party !== undefined) {
                await getDmLock(message.author).runExclusive(async () => {
                    try {
                        let msg = await askInDm(message.author, "DM to Party: ");

                        let embed = new MessageEmbed();
                        embed.setTitle(party.title);
                        embed.setDescription(msg);
                        embed.setColor("GREEN");

                        if(party.coleader !== null && message.author.id === party.coleader.id) {
                            embed.setFooter(`From ${party.coleader.name}`);
                            bot.client.users.fetch(party.leader.id).then(peep => {
                                peep.send(embed);
                            });
                        }

                        if(message.author.id === party.leader.id) {
                            embed.setFooter(`From ${party.leader.name}`);
                            if(party.coleader !== null) {
                                bot.client.users.fetch(party.coleader.id).then(peep => {
                                    peep.send(embed);
                                });
                            }
                        }

                        party.members.forEach(peep => {
                            bot.client.users.fetch(peep.id).then(peep => {
                                peep.send(embed);
                            });
                        });

                        dm(message.author, "DMs sent");
                    } catch (e) { }
                });
            }
        }
    }

}