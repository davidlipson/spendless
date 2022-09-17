export const getHistory = async (uid:string) => {
    try{
      const url = `http://localhost:5000/history?uid=${uid}`;
      const response = await fetch(url)
      const data = await response.json()
      console.log(data)
      // do this better w triggers in db instead of calculating spent in ui
      let total = 0;

      data.forEach((h:any) => {
        total += h.amount;
      })
      return {history: data, spent: total}
    }
    catch(error){
        return {history: [], spent: 0}
    }
  }