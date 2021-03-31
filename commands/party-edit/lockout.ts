import { Command } from "../../handlers/command";
import { Bot } from "../../bot";
import { Message } from "discord.js";
import { updatePartyMsg } from "../../party/party-utils";

import { lRole, emojis } from "../../guild.json";
import {isGuildRole} from "../../utils/dm";

export = class LockoutCommand extends Command {

    aliases: string[] = ["lockout"];
    roles: string[] = [lRole];

    async handle(bot: Bot, message: Message, args: string[]) {
        if(args.length >= 1) {
            const party = bot.parties.all().find(party => party.id === args[0]);
            if(party !== undefined) {
                if(args.length > 2) {

                    let valid = true;

                    let dur = parseInt(args[1], 10);
                    args = args.slice(2).join(" ").split(",").map(r => r.toLowerCase().trim());

                    if(isNaN(dur) || dur <= 0) { valid = false; }
                    for(let role of args) { if(!isGuildRole(bot)(role)) { valid = false; } }

                    if(valid) {
                        let lockout = { start: null, dur: dur * 60, roles: [] };

                        if(party.msgId !== null) { lockout.start = new Date(); }

                        for(let role of args) {
                            if(!party.allowed.includes(role)) {
                                if(!lockout.roles.includes(role)) {
                                    lockout.roles.push(role);
                                }
                            }
                        }
                        if(lockout.roles.length !== 0) {
                            party.lockouts.push(lockout);
                            updatePartyMsg(bot, party);
                            message.react(`<:${emojis.confirm}>`).then();
                            return;
                        }
                    }
                }
            }
        }
        message.react(`<:${emojis.error}>`).then();
    }

}