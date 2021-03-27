import { Command } from "../handlers/command";
import { Bot } from "../bot";
import { Message } from "discord.js";

import { emojis, lRole, pRoles } from "../guild.json"
import {toMiniNickname} from "../utils/nickname";
import logger from "../logger";
import {dmError} from "../utils/dm";

export = class PromoteCommand extends Command {

    aliases: string[] = ["promote"];
    roles: string[] = [lRole];

    async handle(bot: Bot, message: Message, args: string[]) {
        let fails: string[] = [];
        args = args.join(" ").split(",").map(arg => arg.trim().toLowerCase());

        let npRole = pRoles.find(pr => pr.name.includes(args[0]));

        if(npRole) {
            args = args.slice(1);
            let nRole = bot.guild.roles.cache.find(r => npRole.name.includes(r.name.toLowerCase()));
            let opRoles = pRoles.filter(pr => pr.rank < npRole.rank);
            let oRoles = opRoles.map(pr => bot.guild.roles.cache.find(r => pr.name.includes(r.name.toLowerCase())));
            for(let arg of args) {
                try {
                    let member = bot.guild.members.cache.find(gm =>  toMiniNickname(gm.displayName).toLowerCase().includes(arg));
                    if(member) {
                        await member.roles.remove(oRoles);
                        await member.roles.add(nRole);
                    } else { fails.push(arg); }
                } catch (e) { fails.push(arg); }
            }
        }

        if(fails.length > 0) {
            dmError(message.author, fails.map(f => `Couldn't promote "${f}"`).join("\n"));
        } else {
            message.react(`<:${emojis.confirm}>`).then();
        }
    }

}