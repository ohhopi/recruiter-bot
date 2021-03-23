import { Command } from "../../handlers/command";
import { Bot } from "../../bot";
import { Message } from "discord.js";
import { updatePartyMsg } from "../../party/party-utils";
import {askInDm, dm, getDmLock, isComp, isPartyRole} from "../../utils/dm";

import { lRole } from "../../guild.json";
import { msgs } from "../../lib.json";
import {Party} from "../../party/party";

export = class CompCommand extends Command {

    aliases: string[] = ["comp"];
    roles: string[] = [lRole];

    async handle(bot: Bot, message: Message, args: string[]) {
        if(args.length >= 1) {
            const party = bot.parties.all().find(party => party.id === args[0]);
            if(party !== undefined) {
                await getDmLock(message.author).runExclusive(async () => {
                    try {
                        let comp: any = await askInDm(message.author, msgs.askComp, isComp);
                        if(Party.COMPS[comp.toUpperCase()] !== undefined) {
                            comp = Party.COMPS[comp.toUpperCase()]
                        } else {
                            comp = comp.split(/\s+/).map(e => parseInt(e, 10));
                            let max = comp.reduce((a, b) => a + b);
                            comp = { max: max, tank: comp[0], healer: comp[1], ranged: comp[2], melee: comp[3], caster: comp[4], dps: comp[5] }
                        }

                        let reserves = (await askInDm(message.author, msgs.askReserves, isPartyRole)).split(/\s+/);

                        party.comp = comp;
                        for(let reserve of reserves) {
                            party.comp.max--;
                            party.comp[reserve.toLowerCase()]--;
                        }
                        updatePartyMsg(bot, party);
                        dm(message.author, "Party comp updated")
                    } catch (e) { }
                });
            }
        }
    }

}