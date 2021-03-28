export const MS: number = 1000;
export const S: number = 60;

export function toFormattedDateStr(date: Date): string  {
    let year = fixLeadingZero(date.getUTCFullYear().toString(10));
    let month = fixLeadingZero((date.getUTCMonth() + 1).toString(10));
    let day = fixLeadingZero(date.getUTCDate().toString(10));

    return day + "-" + month + "-" + year;
}

export function toFormattedTimeStr(date: Date): string  {
    let hours = fixLeadingZero(date.getUTCHours().toString(10));
    let mins = fixLeadingZero(date.getUTCMinutes().toString(10));

    return hours + ":" + mins;
}

export function toFormattedCountdownStr(countdown: number): string  {
    let str;
    if(countdown >= 60) {
        let hours = fixLeadingZero(Math.trunc(countdown / 60).toString());
        let mins = fixLeadingZero((countdown % 60).toString());
        str = `${hours}:${mins} Hours`;
    } else {
        str = `${countdown % 60} Minutes`;
    }
    return str;
}

export function fixLeadingZero(str: string) { return (str.length === 1) ? "0" + str : str; }

export const dateRegx = /(0*\d|[12]\d|3[01])-(0*\d|1[012])-(\d\d\d\d)\s(0*\d|1\d|2[0123]):([012345]\d)/;

export function parseDate(date: string): Date {
    let match = date.match(dateRegx).slice(1).map(e => parseInt(e, 10));
    if(match !== null) { return new Date(Date.UTC(match[2], match[1] - 1, match[0], match[3], match[4])); }
    return null;
}

export function isDate(inp: string): boolean { return inp.match(dateRegx) !== null }

export function minsBetween(d1: Date, d2: Date): number {
    return Math.round((d1.getTime() - d2.getTime()) / (S * MS));
}

export function minsUntil(date: Date): number { return minsBetween(date, new Date()); }