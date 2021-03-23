import { IMessageHandler } from "./handler";
import { Bot } from "../bot";
import {Message, MessageEmbed} from "discord.js";
import { isValidNickname } from "../utils/nickname";

import { ownerId, msgs } from "../lib.json";
import { lRole } from "../guild.json";
import {dm} from "../utils/dm";
import {minsUntil} from "../utils/time";

export class RoleRequestMod implements IMessageHandler {

    handle(bot: Bot, message: Message) {
        if(message.author.bot) { return; }
        if(message.channel.id !== "815287243194368021") { return; }

        let member = bot.guild.member(message.author);
        if(member.hasPermission("ADMINISTRATOR") || member.user.id === ownerId) { return; }
        if(member.roles.cache.some(r => r.name.toLowerCase() === lRole.toLowerCase())) { return; }

        if(message.content.toLowerCase().includes("name") && message.content.toLowerCase().includes("role")) {
            if(!message.content.toLowerCase().includes("fflogs.com/")) {
                message.channel.send(new MessageEmbed().setColor("RED").setDescription(`${message.author}\n${msgs.giveFFLogs}`)).then();
            }
        }

    }

}