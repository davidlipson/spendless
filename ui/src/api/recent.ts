import { host } from '../environment';

export const getRecent = async (uid: any) => {
    try {
        const url = `${host}/recent?uid=${uid}`;
        const response = await fetch(url);
        const data = await response.json();
        return data[0];
    } catch (error) {
        console.log(error);
        return null;
    }
};
