import payments, { IPayment } from './data';
import { Transform, Readable, Writable, pipeline, TransformCallback } from 'stream';
import { promisify } from 'util';
import { createWriteStream } from 'fs';

const pipelineAsync = promisify(pipeline);

(async () => {

	console.time('stream:run');
	const greaterThan2000 = createWriteStream('greater-than-2000.json', 'utf-8');
	const lessThan2000 = createWriteStream('less-than-2000.json', 'utf-8');

	const readable = new Readable({
		read(data: any): void {
			this.push(data);
		}
	});

	const writeTable = new Writable({
		write(chunk: any, encoding?: any, callback?: any): boolean {

			const data: IPayment = JSON.parse(chunk);

			if (data.total > 2000) {
				greaterThan2000.write(chunk, 'utf-8');
			} else {
				lessThan2000.write(chunk, 'utf-8');
			}
			
			callback();
			return true;
		}
	});
	

	const calculateTotal = new Transform({
		transform(
			chunk: string, encoding: BufferEncoding, callback: TransformCallback
		): void {
			const data: IPayment = JSON.parse(chunk);

			data.total = data.items.reduce((total, item) => total + item, 0);

			const result = JSON.stringify(data);
			callback(null, result);
		}
	});

	const processPayment = new Transform({
		transform(
			chunk: string, encoding: BufferEncoding, callback: TransformCallback
		): void {
			const data: IPayment = JSON.parse(chunk);

			data.isPaid = true;

			const result = JSON.stringify(data);
			callback(null, result);
		}
	});

	payments.forEach((payment) => readable.push(JSON.stringify(payment)));
	// terminate data. last item is null
	readable.push(null);

	await pipelineAsync(
		readable,
		calculateTotal,
		processPayment,
		writeTable,
	);

	console.timeEnd('stream:run');
})();
