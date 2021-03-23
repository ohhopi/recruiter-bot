import { Command } from "../../handlers/command";
import { Bot } from "../../bot";
import { Message } from "discord.js";
import * as xl from "excel4node";

import { lRole } from "../../guild.json";
import { roles } from "../../lib.json";

export = class SheetCommand extends Command {

    aliases: string[] = ["sheet"];
    roles: string[] = [lRole];

    async handle(bot: Bot, message: Message, args: string[]) {
        if(args.length >= 1) {
            const party = bot.parties.all().find(party => party.id === args[0]);
            if(party !== undefined) {

                let wb = new xl.Workbook();
                let ws1 = wb.addWorksheet("Ingame Names");
                let ws2 = wb.addWorksheet("Discord Names");

                for(let i = 0; i < roles.length; ++i) {
                    ws1.cell(1, (i * 2) + 1).string(roles[i].toUpperCase());
                    ws2.cell(1, (i * 2) + 1).string(roles[i].toUpperCase());

                    let members = party.members.filter(member => member.role === roles[i]);
                    for(let j = 0; j < members.length; ++j) {
                        ws1.column((i * 2) + 1).setWidth(25);       ws2.column((i * 2) + 1).setWidth(25);
                        ws1.column((i * 2) + 2).setWidth(5);        ws2.column((i * 2) + 2).setWidth(5);

                        ws1.cell(j + 2, (i * 2) + 1).string(members[j].name);

                        let gm = await bot.guild.members.fetch(members[j].id);
                        ws2.cell(j + 2, (i * 2) + 1).string(gm.user.tag);

                        ws1.cell(j + 2, (i * 2) + 2).number(0);     ws2.cell(j + 2, (i * 2) + 2).number(0);
                    }
                }

                wb.writeToBuffer().then(buffer => {
                    message.author.send({
                        files: [{
                            attachment: buffer,
                            name: 'attendance.xlsx'
                        }]
                    })
                });

            }
        }
    }

}