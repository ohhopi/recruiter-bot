import { Command } from "../handlers/command";
import { Bot } from "../bot";
import { Message } from "discord.js";

import { emojis, gRole, pRoles } from "../guild.json"
import {toMiniNickname} from "../utils/nickname";
import logger from "../logger";
import {askInDm, dm, dmError, getDmLock} from "../utils/dm";
import {msgs} from "../lib.json";
import {updatePartyMsg} from "../party/party-utils";

export = class DemoteCommand extends Command {

    aliases: string[] = ["demote"];
    roles: string[] = [gRole];

    async handle(bot: Bot, message: Message, args: string[]) {
        let fails: string[] = [];
        args = args.join(" ").split(",").map(arg => arg.trim().toLowerCase());

        let npRole = pRoles.find(pr => pr.name.includes(args[0]));

        if(npRole) {
            args = args.slice(1);
            let nRole = bot.guild.roles.cache.find(r => npRole.name.includes(r.name.toLowerCase()));
            let opRoles = pRoles.filter(pr => pr.rank > npRole.rank);
            let oRoles = opRoles.map(pr => bot.guild.roles.cache.find(r => pr.name.includes(r.name.toLowerCase())));

            let reason = null;
            let log = null;

            await getDmLock(message.author).runExclusive(async () => {
                try {
                    reason = await askInDm(message.author, msgs.askReason);
                    log = await askInDm(message.author, msgs.askLog);
                } catch (e) { }
            });

            let members = (await bot.guild.members.fetch()).array();
            if(reason !== null && log !== null) {
                for(let arg of args) {
                    try {
                        let member = members.find(gm =>  toMiniNickname(gm.displayName).toLowerCase().includes(arg));
                        if(member) {
                            let shouldDemote = true;
                            for(let r of member.roles.cache.array()) {
                                for(let pr of pRoles) {
                                    if(pr.name.includes(r.name.toLowerCase())) {
                                        if(pr.rank <= npRole.rank) {
                                            fails.push(arg);
                                            shouldDemote = false;
                                        }
                                    }
                                }
                            }

                            if(!shouldDemote) { continue; }
                            await member.roles.remove(oRoles);
                            await member.roles.add(nRole);
                            let msg = msgs.demote
                                .replace("${role}", nRole.name)
                                .replace("${reason}", reason)
                                .replace("${log}", log);
                            dm(member.user, msg);
                        } else { fails.push(arg); }
                    } catch (e) { fails.push(arg); }
                }
            }
        }

        if(fails.length > 0) {
            dmError(message.author, fails.map(f => `Couldn't demote "${f}"`).join("\n"));
        } else {
            message.react(`<:${emojis.confirm}>`).then();
        }
    }

}