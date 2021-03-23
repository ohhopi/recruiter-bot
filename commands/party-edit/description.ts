import { Command } from "../../handlers/command";
import { Bot } from "../../bot";
import { Message } from "discord.js";
import { updatePartyMsg } from "../../party/party-utils";
import { askInDm, dm, getDmLock } from "../../utils/dm";

import { lRole } from "../../guild.json";
import { msgs } from "../../lib.json";


export = class DescriptionCommand extends Command {

    aliases: string[] = ["description"];
    roles: string[] = [lRole];

    async handle(bot: Bot, message: Message, args: string[]) {
        if(args.length >= 1) {
            const party = bot.parties.all().find(party => party.id === args[0]);
            if(party !== undefined) {
                await getDmLock(message.author).runExclusive(async () => {
                    try {
                        party.description = await askInDm(message.author, msgs.askDescription);
                        updatePartyMsg(bot, party);
                        dm(message.author, "Description updated");
                    } catch (e) { }
                });
            }
        }
    }

}