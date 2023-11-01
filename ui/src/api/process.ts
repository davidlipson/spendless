import { host } from '../environment';

export const processTransaction = async (
    uid: string,
    tid: string
): Promise<Response> => {
    return await fetch(`${host}/process`, {
        method: 'POST',
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            uid,
            tid,
        }),
    });
};
