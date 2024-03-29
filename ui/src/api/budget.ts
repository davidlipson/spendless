import { host } from '../environment';

export const updateBudget = async (uid: string, budget: number) => {
    const requestOptions = {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            uid,
            budget,
        }),
    };
    const url = `${host}/budget`;
    await fetch(url, requestOptions);
};
