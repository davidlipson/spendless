export const updateBudget = async(uid: string, budget: number ) => {
    const requestOptions = {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          uid,
          budget
        })
    };
    const url = "http://localhost:5000/budget";
    await fetch(url, requestOptions);
}