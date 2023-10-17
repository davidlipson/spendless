import { host } from '../environment';

export const ignoreTransaction = async (uid: string, id: string) => {
    const requestOptions = {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            uid,
            id,
        }),
    };
    const url = `${host}/ignore`;
    await fetch(url, requestOptions);
};
