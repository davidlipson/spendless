export const getHistory = async (uid:string) => {
    try{
      const url = `${process.env.REACT_APP_API_URL}/history?uid=${uid}`;
      const response = await fetch(url)
      return await response.json()
    }
    catch(error){
        return {history: [], spent: 0}
    }
  }