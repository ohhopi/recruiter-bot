import { ITickHandler } from "./handler";
import { Bot } from "../bot";
import { toFormattedTimeStr } from "../utils/time";

export class ClockUpdater implements ITickHandler {

    handle(bot: Bot, now: Date) {
        bot.client.user.setActivity(`${toFormattedTimeStr(now)} ST`).then();
    }

}