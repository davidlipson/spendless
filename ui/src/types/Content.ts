import { User } from './User';

export interface ContentArgs {
    recent: any;
    page: string;
    query: string;
    description: string;
    url: string;
    user: User;
    totalRegex: any;
    processButtons: string[];
    processButtonEndWords: string[];
}
