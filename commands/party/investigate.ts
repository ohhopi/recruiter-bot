import { Command } from "../../handlers/command";
import { Bot } from "../../bot";
import { GuildAuditLogs, Message } from "discord.js";

import { lRole, emojis } from "../../guild.json";
import {minsUntil, toFormattedDateStr} from "../../utils/time";
import {toMiniNickname} from "../../utils/nickname";
import axios from "axios";
import Table from "easy-table";
import logger from "../../logger";

export = class AuditCommand extends Command {

    aliases: string[] = ["investigate"];
    roles: string[] = [lRole];

    async handle(bot: Bot, message: Message, args: string[]) {
        if(args.length >= 1) {
            const party = bot.parties.all().find(party => party.id === args[0]);
            if(party === undefined ) { return; }

            let days = 7;
            if(args.length >= 2) {
                let num = parseInt(args[1], 10);
                if(isNaN(num) || num < 1 || num > 24) { return; }
                days = num;
            }

            //Trying to find the suspect nicknames
            let suspects: ISuspect[] = [];
            for(let member of party.members) {
                let audits = await bot.guild.fetchAuditLogs({ type: "MEMBER_UPDATE", user: member.id });
                let suspect = findIllegalNicknameChange(audits, days);
                if(suspect !== null) { suspects.push(suspect); }
            }

            if(suspects.length === 0) {
                message.channel.send("My investigations show nothing!").then();
                return;
            }

            message.channel.send("My investigations lead me to something...").then(async msg => {
                let table = new Table();
                for(let s of suspects) {
                    table.cell("At", toFormattedDateStr(s.date));
                    table.cell("Old", s.old);
                    table.cell("New", s.new);

                    let id: any = "ERROR";
                    let cheevo: any = "ERROR";
                    try {
                        id = await getLodestoneId(toDetailedEntry(s.new));
                        if(id !== undefined) { cheevo = await hasClearCheevo(id); } else { id = "NOT FOUND"; }
                    } catch (e) { }

                    table.cell("Lodestone", id);
                    table.cell("Cheevo", cheevo);
                    table.newRow();
                }

                msg.edit(`\`\`\`\n${table.toString()}\n\`\`\`\n`).then();
            });
        }
    }

}

interface ISuspect {
    date: Date,
    old: string,
    new: string
}

function findIllegalNicknameChange(log: GuildAuditLogs, days: number): ISuspect {
    let res: ISuspect = null;

    for(let entry of log.entries.array()) {
        if(minsUntil(entry.createdAt) < -(days * 24 * 60)) { continue; }
        let change = entry.changes.find(c => c.key === "nick");
        if(change !== undefined && change.old !== undefined) {
            if(toMiniNickname(change.old).toLowerCase() !== toMiniNickname(change.new).toLowerCase()) {
                res = { date: entry.createdAt, old: change.old, new: change.new };
                break;
            }
        }
    }

    return res;
}

interface ICharacter {
    server: string,
    fname: string,
    lname: string
}

function toDetailedEntry(name: string): ICharacter {
    let nickname = toMiniNickname(name).toLowerCase();

    let server = sMap[nickname[1].toLowerCase()];
    let names = nickname.slice(3).split(/\s+/).map(n => n.toLowerCase());
    return { server: server, fname: names[0], lname: names[1] }
}

let sMap = {
    r: "ragnarok",
    o: "omega",
    c: "cerberus",
    l: "louisoix",
    m: "moogle",
    s: "spriggan",
}

async function getLodestoneId(c: ICharacter) {
    let id = undefined;
    let req = await axios.get(`https://xivapi.com/character/search?name=${c.fname}+${c.lname}&server=${c.server}&private_key=${process.env.XIV_API_KEY}`);
    if(req.data["Results"].length !== 0) {
        id = req.data["Results"][0]["ID"];
    }
    return id;
}

async function hasClearCheevo(id: number) {
    let req = await axios.get(`https://xivapi.com/character/${id}?data=AC&private_key=${process.env.XIV_API_KEY}`);
    if(req.data["AchievementsPublic"] === true) {
        let cheevos: { Date: number, ID: number }[] = req.data["Achievements"]["List"];
        if(cheevos.some(cheevo => cheevo.ID === 2765)) {
            return "HAS CHEEVO";
        }
        return "NO CHEEVO";
    }
    return "NOT PUBLIC"
}