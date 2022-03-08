export function getPercentage(a: number, b: number): number {
	return Math.floor(100*Math.max(0, a / b));
}

export function getCurrency(a:number): string{
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

export function getRange(total:number, budget:number){
    if (100*total/budget < 75){
      return {class: "below-budget", colour: "rgb(75,176,248)"}
    }
    else if (100*total/budget < 100){
      return {class: "approaching-budget", colour: "rgb(248,200,75)"}
    }
     else{
      return {class: "above-budget", colour: "rgb(248,75,75)"}
    }
  }