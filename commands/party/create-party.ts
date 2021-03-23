import {Command, CommandHandler} from "../../handlers/command";
import { Bot } from "../../bot";
import { Message } from "discord.js";
import { askInDm, getDmLock, isComp, isDur, islRole, isGuildRole, isPartyRole } from "../../utils/dm";
import { isDate, parseDate } from "../../utils/time";

import { lRole } from "../../guild.json";
import { msgs } from "../../lib.json";
import { Party } from "../../party/party";
import { buildPartyEmbed } from "../../party/party-utils";

class PartyCommand extends Command {

    aliases: string[] = ["party"];
    roles: string[] = [lRole];

    constructor(handler: CommandHandler) {
        super(handler);
        for(let comp in Party.COMPS) {
            handler.commands.push(new CompShortcut(handler, comp));
        }
    }

    async handle(bot: Bot, message: Message, args: string[]) {
        await startPartyCreation(bot, message, args);
    }
}

class CompShortcut extends Command {

    private readonly comp: string;
    aliases: string[] = [];
    roles: string[] = [lRole];

    constructor(handler: CommandHandler, comp: string) {
        super(handler);
        this.comp = comp;
        this.aliases = [this.comp.toLowerCase()];
    }

    async handle(bot: Bot, message: Message, args: string[]) {
        await startPartyCreation(bot, message, [this.comp]);
    }
}

async function startPartyCreation(bot: Bot, message: Message, args: string[]) {

    let comp = undefined;
    if(args.length > 0) { comp = Party.COMPS[args[0].toUpperCase()]; }

    await getDmLock(message.author).runExclusive(async () => {
        try {
            let title = await askInDm(message.author, msgs.askTitle);
            let description = await askInDm(message.author, msgs.askDescription);

            let clName = await askInDm(message.author, msgs.askCoLeader, islRole(bot));
            let coleader = null;
            if(clName.toLowerCase() !== "none") {
                let clMember = bot.guild.roles.cache.find(r => r.name.toLowerCase() === lRole)
                    .members.find(m => m.displayName.toLowerCase().includes(clName.toLowerCase()));
                coleader = { id: clMember.id, name: clMember.displayName };
            }

            let date = parseDate(await askInDm(message.author, msgs.askDate, isDate));

            let dur = (await askInDm(message.author, msgs.askDur, isDur)).split(/\s+/).map(e => parseInt(e, 10));

            if(!comp) {
                comp = await askInDm(message.author, msgs.askComp, isComp);
                if(Party.COMPS[comp.toUpperCase()] !== undefined) {
                    comp = Party.COMPS[comp.toUpperCase()]
                } else {
                    comp = comp.split(/\s+/).map(e => parseInt(e, 10));
                    let max = comp.reduce((a, b) => a + b);
                    comp = { max: max, tank: comp[0], healer: comp[1], ranged: comp[2], melee: comp[3], caster: comp[4], dps: comp[5] }
                }
            }

            const party = new Party();
            party.title = title;
            party.description = description;
            party.leader = { id: message.author.id, name: bot.guild.member(message.author).displayName };
            party.coleader = coleader;
            party.date = date;
            party.dur = { min: dur[0], max: dur[1] };
            party.comp = comp;

            let reserves = (await askInDm(message.author, msgs.askReserves, isPartyRole)).split(/\s+/);
            for(let reserve of reserves) {
                party.comp.max--;
                party.comp[reserve.toLowerCase()]--;
            }

            party.allowed = (await askInDm(message.author, msgs.askAllowedRoles, isGuildRole(bot))).split(",").map(r => r.toLowerCase().trim());

            bot.parties.upsert(party);
            message.author.send(party.id).then();
            message.author.send(buildPartyEmbed(party)).then();

        } catch (e) { }
    });
}

export = PartyCommand;