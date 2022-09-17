export const getRange = (total:number, budget:number) => {
    if (100*total/budget < 75){
      return {class: "spendless-ext-below-budget", colour: "#679093"}
    }
    else if (100*total/budget < 100){
      return {class: "spendless-ext-approaching-budget", colour: "#DCC7B4"}
    }
     else{
      return {class: "spendless-ext-above-budget", colour: "#D98C74"}
    }
}

export const getPercentage = (a: number, b: number): number => {
	return Math.ceil(100*Math.max(0, a / b));
}

export const getCurrency = (a:number): string => {
	try{
		return a.toLocaleString('en-US', {
			style: 'currency',
			currency: 'USD',
		})
	}
	catch(e){
		return ""
	}
}