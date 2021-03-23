import { IMessageHandler } from "./handler";
import { Bot } from "../bot";
import { Message } from "discord.js";
import { isValidNickname } from "../utils/nickname";

import { ownerId, msgs } from "../lib.json";
import { lRole } from "../guild.json";
import {dm} from "../utils/dm";
import {minsUntil} from "../utils/time";

export class NicknameNagger implements IMessageHandler {

    warnings = {};

    handle(bot: Bot, message: Message) {
        if(message.author.bot) { return; }

        let member = bot.guild.member(message.author);
        if(member.hasPermission("ADMINISTRATOR") || member.user.id === ownerId) { return; }
        if(member.roles.cache.some(r => r.name.toLowerCase() === lRole.toLowerCase())) { return; }

        if(!isValidNickname(bot.guild.member(message.author).displayName)) {
            if(this.warnings[member.user.id] === undefined) {
                this.warnings[member.user.id] = new Date();
                dm(member.user, msgs.changeNickname);
            } else if(minsUntil(this.warnings[member.user.id]) < -20) {
                this.warnings[member.user.id] = new Date();
                dm(member.user, msgs.changeNickname);
            }
        }
    }

}