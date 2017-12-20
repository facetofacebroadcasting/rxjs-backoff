const Rx = require('rxjs');
const { test } = require('tape');
require('../src/index');

const Observable = Rx.Observable;


// Sample promise. Tell it which attempt you would like it to succeed on
const succeedOn = (on) => {
	let attempts = 0;

	return () => new Promise((resolve, reject) => {
		attempts += 1;
		if (attempts >= on) {
			resolve('success');
		} else {
			reject('error');
		}
	});
};


test('Exponential backoff', (t1) => {
	t1.test('create an observable', (t) => {
		const prom = succeedOn(1);
		const source = Observable
			.defer(() => prom())
			.backoff({
				maxRetries: 0,
			})
			.map(() => '123');

		source.subscribe((val) => {
			t.ok(val, '123');
			t.end();
		});
	});

	t1.test('succeeds after several failures', (t) => {
		const prom = succeedOn(3);
		const source = Observable.of(1, 2)
			.switchMap(() => Observable
				.defer(() => prom())
				.backoff({
					maxRetries: 2,
				}),
			);

		source.subscribe((val) => {
			t.ok(val, 'success');
			t.end();
		});
	});

	t1.test('throws err after exceeding max retries', (t) => {
		const prom = succeedOn(4);
		const source = Observable.of(1)
			.switchMap(() => Observable
				.defer(() => prom())
				.backoff({
					maxRetries: 2,
				}),
			);

		source.subscribe(null, (err) => {
			t.equal(err, 'error');
			t.end();
		});
	});

	t1.test('does not retry when retryWhen returns false', (t) => {
		const prom = succeedOn(3);
		const source = Observable.of(1)
			.switchMap(() => Observable
				.defer(() => prom())
				.backoff({
					maxRetries: 2,
					retryWhen: () => false,
				}),
			);

		source.subscribe(null, (err) => {
			t.equal(err, 'error');
			t.end();
		});
	});
});
