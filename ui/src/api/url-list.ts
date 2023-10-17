import { host } from '../environment';

export interface UrlListArgs {
    whitelist: any;
    blacklist: string[];
    totalRegex: string | null;
    processButtons: string[];
    processButtonEndWords: string[];
}

export const getUrlList = async (): Promise<UrlListArgs> => {
    try {
        const url = `${host}/list`;
        const response = await fetch(url);
        const data = await response.json();
        return data;
    } catch (error) {
        return {
            whitelist: {},
            blacklist: [],
            totalRegex: null,
            processButtons: [],
            processButtonEndWords: [],
        };
    }
};
