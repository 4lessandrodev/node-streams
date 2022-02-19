import { randomBytes, randomUUID } from "crypto"

export interface IPayment {
	id: string;
	process: string;
	isPaid: boolean;
	items: number[];
	total: number;
	createdAt: Date;
}

const generatePrice = (): number => Math.trunc(Math.random() * 1000);

const makePayment = (): IPayment => (
	{
		id: randomUUID(),
		process: randomBytes(7).toString('hex'),
		isPaid: false,
		items: [
			generatePrice(),
			generatePrice(),
			generatePrice(),
			generatePrice()
		],
		total: 0,
		createdAt: new Date()
	}
);

export const payments:IPayment[] = [];

let index = 0;
let limit = 1000000;

console.time('generate:data');
while (index < limit) {
	payments.push(makePayment());
	index++;
}
console.timeEnd('generate:data');
export default payments;
