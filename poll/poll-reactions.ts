import {Mutex} from "async-mutex";
import {Bot} from "../bot";
import {Poll} from "./poll";
import {GuildMember, MessageReaction, TextChannel, User} from "discord.js";
import {dm, dmError} from "../utils/dm";
import {isValidNickname} from "../utils/nickname";
import {poll_emoji,lRole,hRole} from "../guild.json";
import {updatePollMsg} from "./poll-utils";
import logger from "../logger";
import { minsUntil } from "../utils/time";

declare module "discord.js" {
    export interface ReactionCollector {
        lock: Mutex;
    }
}

export function createPollReactionHandler(bot: Bot, poll: Poll) {
    if(poll.channelId === null || poll.msgId === null) { return; }
    bot.client.channels.fetch(poll.channelId).then((channel: TextChannel) => {
        channel.messages.fetch(poll.msgId).then(msg => {

            const rCollector = msg.createReactionCollector(filterReactionsAdd, { dispose: true });
            rCollector.lock = new Mutex();
            
            let countdown = minsUntil(poll.date);

            rCollector.on("collect", async (reaction: MessageReaction, user: User) => {
                // dm(user, "Your vote is being processed");
                await rCollector.lock.runExclusive(async () => {
                    const vote = poll.answers[Object.values(poll_emoji).indexOf(reaction.emoji.name)]
                    const member = bot.guild.member(user);
                    if(countdown > 0){
                        registerInPoll(poll, member, vote)
                        updatePollMsg(bot, poll);
                    } else {
                        dmError(member.user, `The voting period for ${poll.title} by ${poll.creator.name} has expired`);
                    }
                })
            });

        
            rCollector.on("remove", async (reaction: MessageReaction, user: User) => {
                // dm(user, "Your vote withdrawal is being processed");
                await rCollector.lock.runExclusive(async () => {
                    const vote = poll.answers[Object.values(poll_emoji).indexOf(reaction.emoji.name)]
                    const member = bot.guild.member(user);
                    if(countdown > 0){
                        unregisterFromPoll(poll, member, vote)
                        updatePollMsg(bot, poll);
                    } else {
                        dmError(member.user, `The voting period for ${poll.title} by ${poll.creator.name} has expired`);
                    }
                })
            });

        });
    });
}

function filterReactionsAdd(reaction: MessageReaction, user: User) {
    if(user.bot) { return false; }
    if(!Object.values(poll_emoji).includes(reaction.emoji.name)) { reaction.remove().then(); return false; }
    return true;
}

export function registerInPoll(poll: Poll, gm: GuildMember, answer: string) {
    if(poll.voters.some(m => m.id === gm.user.id && m.answer === answer)) {
        dmError(gm.user, `Already voted in the ${poll.title} poll for ${answer} by ${poll.creator.name}`);
        return false;
    }

    if(!gm.roles.cache.some(role => poll.allowed.includes(role.name.toLowerCase().trim()))) {
        if(!gm.roles.cache.some(r => lRole === r.name.toLowerCase() || hRole === r.name.toLowerCase())) {
            dmError(gm.user, `Incorrect role to register in the "${poll.title}" poll`);
            return false;
        }
    }

    poll.voters.push({ id: gm.user.id, name: gm.displayName, answer: answer });
    // dm(gm.user, `Registered vote ${answer} in the "${poll.title}" poll`);
    return true;
}

export function unregisterFromPoll(poll: Poll, gm: GuildMember, answer: string) {
     let member = poll.voters.find(m => m.id === gm.user.id && m.answer === answer);
    if(member) {
        poll.voters = poll.voters.filter(m => m.id !== member.id || ( m.id === member.id && m.answer !== answer));
        // dm(gm.user, `Removed vote ${answer} from the "${poll.title}" poll`);
        return true;
    }
    return false;
}