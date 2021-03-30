import { Command } from "../handlers/command";
import { Bot } from "../bot";
import { Message } from "discord.js";

import { emojis, gRole, pRoles } from "../guild.json"
import {toMiniNickname} from "../utils/nickname";
import logger from "../logger";
import {dmError} from "../utils/dm";

export = class PromoteCommand extends Command {

    aliases: string[] = ["promote"];
    roles: string[] = [gRole];

    async handle(bot: Bot, message: Message, args: string[]) {
        let fails: string[] = [];
        args = args.join(" ").split(",").map(arg => arg.trim().toLowerCase());

        let npRole = pRoles.find(pr => pr.name === args[0]);

        if(npRole) {
            args = args.slice(1);
            let nRole = bot.guild.roles.cache.find(r => npRole.name === r.name.toLowerCase());
            let opRoles = pRoles.filter(pr => pr.rank < npRole.rank);
            let oRoles = opRoles.map(pr => bot.guild.roles.cache.find(r => pr.name === r.name.toLowerCase()));

            let members = (await bot.guild.members.fetch()).array();
            for(let arg of args) {
                try {
                    let member = members.find(gm =>  toMiniNickname(gm.displayName).toLowerCase().includes(arg));
                    if(member) {
                        let shouldPromote = true;
                        for(let r of member.roles.cache.array()) {
                            for(let pr of pRoles) {
                                if(pr.name === r.name.toLowerCase()) {
                                    if(pr.rank >= npRole.rank) {
                                        fails.push(arg);
                                        shouldPromote = false;
                                    }
                                }
                            }
                        }

                        if(!shouldPromote) { continue; }
                        await member.roles.remove(oRoles);
                        await member.roles.add(nRole);
                    } else { fails.push(arg); }
                } catch (e) { fails.push(arg); }
            }
        } else {
            message.react(`<:${emojis.error}>`).then();
            return;
        }

        if(fails.length > 0) {
            dmError(message.author, fails.map(f => `Couldn't promote "${f}"`).join("\n"));
            message.react(`<:${emojis.error}>`).then();
        } else {
            message.react(`<:${emojis.confirm}>`).then();
        }
    }

}