export function getPercentage(a: number, b: number): number {
	return 100*Math.max(0, a / b);
}