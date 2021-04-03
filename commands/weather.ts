import { Command } from "../handlers/command";
import { Bot } from "../bot";
import {Message, MessageEmbed, MessageReaction, User} from "discord.js";
import { MS, S, toFormattedTimeStr } from "../utils/time";
import {emojis} from "../guild.json";
import {Mutex} from "async-mutex";

export = class ForecastCommand extends Command {

    aliases: string[] = ["forecast", "weather"];
    roles: string[] = null;

    handle(bot: Bot, message: Message, args: string[]) {

        let hours = 24;
        if(args.length >= 1) {
            let num = parseInt(args[0], 10);
            if(isNaN(num) || num < 1 || num > 48) { message.react(`<:${emojis.confirm}>`).then(); return; }
            hours = num;
        }

        let steps = hours * 60;
        let date = new Date();
        let forecasts: IForecast[] = [];

        forecasts.push({ weather: forecast(date), start: toFormattedTimeStr(date) });

        for(let i = 0; i < steps; ++i) {
            if(last(forecasts).weather === forecast(date)) { stepInTime(date, 1); }
            else {
                last(forecasts).end = toFormattedTimeStr(date);
                forecasts.push({ weather: forecast(date), start: toFormattedTimeStr(date) });
            }
        }

        while(last(forecasts).weather === forecast(date)) { stepInTime(date, 1); }
        last(forecasts).end = toFormattedTimeStr(date);

        message.channel.send(buildForecastEmbed(forecasts)).then(async msg => {

            let pages = Math.ceil(forecasts.length / 24);
            if(pages === 1) { return; }
            let rCollector = msg.createReactionCollector(filterReactions, { time: 15 * S * MS });
            rCollector.forecasts = forecasts;
            rCollector.page = 1;
            rCollector.pages = pages;

            rCollector.on("collect", async (reaction: MessageReaction, user: User) => {
                reaction.users.remove(user).then();
                if(reaction.emoji.name === "⬅️") {
                    if(rCollector.page === 1) { return; }
                    --rCollector.page;
                }
                if(reaction.emoji.name === "➡️") {
                    if(rCollector.page === rCollector.pages) { return; }
                    ++rCollector.page;
                }
                msg.edit("", buildForecastEmbed(rCollector.forecasts, rCollector.page)).then();
            });

            rCollector.on("end", () => { msg.delete().then(); });

            await msg.react("⬅️").then();
            await msg.react("➡️").then();
        });
    }

}

declare module "discord.js" {
    export interface ReactionCollector {
        forecasts: IForecast[];
        pages: number;
        page: number;
    }
}

function last<T>(arr: T[]) { return arr[arr.length - 1]; }
function stepInTime(date: Date, mins: number) {
    date.setTime(date.getTime() + (mins * S * MS));
}

function calculateForecastTarget(date: Date): number {
    // Thanks to Rogueadyn's SaintCoinach library for this calculation.
    // date is the current local time.

    let unixSeconds = Math.floor(date.getTime() / 1000);

    // Get Eorzea hour for weather start
    let bell = unixSeconds / 175;

    // Do the magic 'cause for calculations 16:00 is 0, 00:00 is 8 and 08:00 is 16
    let increment = (bell + 8 - (bell % 8)) % 24;

    // Take Eorzea days since unix epoch
    let totalDays = unixSeconds / 4200;
    totalDays = (totalDays << 32) >>> 0; // Convert to uint
    let calcBase = totalDays * 100 + increment;
    let step1 = (calcBase << 11) ^ calcBase;
    let step2 = (step1 >>> 8) ^ step1;
    return step2 % 100;
}

interface IForecast {
    weather: string,
    start: string,
    end?: string
}

function forecast(date: Date): string {
    let chance = calculateForecastTarget(date);
    if (chance < 52) { return `<:${emojis.fair}> Fair`; }
    if (chance < 64) { return `<:${emojis.rain}> Rain`; }
    if (chance < 76) { return `<:${emojis.wind}> Wind`; }
    if (chance < 88) { return `<:${emojis.thunder}> Thunder`; }
    return `<:${emojis.dust}> Dust`;
}

function buildForecastEmbed(forecasts: IForecast[], page= 1) {
    let embed = new MessageEmbed().setTitle(`Bozjan Weather Forecast #${page}`).setColor("ORANGE");

    let start = (page - 1) * 24;
    let end = Math.min(forecasts.length, page * 24);

    for(let i = start; i < end; ++i) {
        embed.addField(`${forecasts[i].start} ST to ${forecasts[i].end} ST`, forecasts[i].weather, true);
    }

    embed.setFooter("I will auto delete this menu once it's 15 minutes old");

    return embed;
}

function filterReactions(reaction: MessageReaction, user: User) {
    if(user.bot) { return false; }
    if(reaction.emoji.name !== "⬅️" && reaction.emoji.name !== "➡️") { reaction.remove().then(); return false; }
    return true;
}