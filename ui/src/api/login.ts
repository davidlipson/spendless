import Cookies from 'universal-cookie';
import { host } from '../environment';
import { SPENDLO_COOKIE } from '../types';
const cookies = new Cookies();

export const loginUser = async (prof: any, setCookie = false) => {
    try {
        const requestOptions = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                first_name: prof.givenName,
                last_name: prof.familyName,
                email: prof.email,
            }),
        };
        const url = `${host}/login`;
        const response = await fetch(url, requestOptions);
        const data = await response.json();
        if (setCookie) {
            cookies.set(SPENDLO_COOKIE as string, data[0].id as string, {
                path: '/',
            });
        }
        return data[0];
    } catch (error) {
        console.log(error);
        return false;
    }
};

export const onboardUser = async (uid: string) => {
    try {
        const requestOptions = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                uid,
            }),
        };
        const url = `${host}/onboard`;
        const response = await fetch(url, requestOptions);
        const data = await response.json();
        return data[0];
    } catch (error) {
        console.log(error);
        return false;
    }
};
