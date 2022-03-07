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