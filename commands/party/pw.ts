import { Command } from "../../handlers/command";
import { Bot } from "../../bot";
import {Message, MessageEmbed} from "discord.js";

import {emojis, lRole} from "../../guild.json";
import { askInDm, dm, getDmLock } from "../../utils/dm";

export = class PwCommand extends Command {

    aliases: string[] = ["pw"];
    roles: string[] = [lRole];

    async handle(bot: Bot, message: Message, args: string[]) {
        if(args.length >= 1) {
            const party = bot.parties.all().find(party => party.id === args[0]);
            if(party !== undefined) {
                if(args.length > 1) {
                    party.pw = args.slice(1).join(" ");

                    if(party.coleader !== null && message.author.id === party.coleader.id) {
                        bot.client.users.fetch(party.leader.id).then(peep => {
                           dm(peep, `Party Password is ${party.pw}`);
                        });
                    }

                    if(message.author.id === party.leader.id) {
                        if(party.coleader !== null) {
                            bot.client.users.fetch(party.coleader.id).then(peep => {
                                dm(peep, `Party Password is ${party.pw}`);
                            });
                        }
                    }

                    party.members.forEach(peep => {
                        bot.client.users.fetch(peep.id).then(peep => {
                            dm(peep, `Party Password is ${party.pw}`);
                        });
                    });

                    message.react(`<:${emojis.confirm}>`).then();
                    return;
                }
            }
        }
        message.react(`<:${emojis.error}>`).then();
    }
}