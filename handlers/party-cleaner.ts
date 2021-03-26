import { ITickHandler } from "./handler";
import { Bot } from "../bot";
import { minsUntil, S } from "../utils/time";
import { deleteParty, updatePartyMsg } from "../party/party-utils";

export class PartyCleaner implements ITickHandler {

    handle(bot: Bot, now: Date) {
        for(let party of bot.parties.all()) {
            let countdown = minsUntil(party.date);
            if(countdown >= (-party.dur.max * S - 1)) {
                updatePartyMsg(bot, party);
            }
            if(countdown < (-12 * S)) {
                deleteParty(bot, party);
            }
        }

        bot.parties.persist();
    }

}