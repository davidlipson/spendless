export const ignoreTransaction = async(uid: string, id: string, ) => {
        const requestOptions = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
              uid,
              id
            })
        };
        const url = `${process.env.REACT_APP_API_URL}/ignore`;
        await fetch(url, requestOptions);
  }