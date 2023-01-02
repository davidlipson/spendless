import Cookies from 'universal-cookie';
const cookies = new Cookies();

export const loginUser = async (prof: any) => {
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
        const url = `${process.env.REACT_APP_API_URL}/login`;
        const response = await fetch(url, requestOptions);
        const data = await response.json();
        cookies.set(
            process.env.REACT_APP_SPENDLESS_COOKIE_NAME as string,
            data[0].id as string,
            { path: '/' }
        );
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
        const url = `${process.env.REACT_APP_API_URL}/onboard`;
        const response = await fetch(url, requestOptions);
        const data = await response.json();
        return data[0]
    } catch (error) {
        console.log(error);
        return false;
    }
};
