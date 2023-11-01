import { host } from '../environment';

export const addTransaction = async (
    uid: string,
    amount?: number,
    description?: string,
    tid?: string
): Promise<Response> => {
    return await fetch(`${host}/add`, {
        method: 'POST',
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            uid,
            amount,
            description,
            tid,
        }),
    });
};
