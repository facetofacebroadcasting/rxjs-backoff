const { Observable } = require('rxjs/Observable');
require('rxjs/add/observable/defer');
require('rxjs/add/observable/of');
require('rxjs/add/observable/throw');
require('rxjs/add/observable/timer');
require('rxjs/add/operator/retryWhen');
require('rxjs/add/operator/mergeMap');
require('rxjs/add/operator/delayWhen');


const DEFAULT_MAX_RETRIES = 3;
const DEFAULT_MAX_DELAY = 2000;
const DEFAULT_INITIAL_DELAY = 100;
const DEFAULT_MULTIPLIER = 2;


function validateRetryWhen(func) {
	if (typeof func !== 'function') {
		return () => true;
	}
	return func;
}

function validateMaxRetries(retries) {
	if (Number.isInteger(retries) && retries >= 0) {
		return retries;
	}
	return DEFAULT_MAX_RETRIES;
}

function validateMaxDelay(delay) {
	if (Number.isInteger(delay) && delay > 0) {
		return delay;
	}
	return DEFAULT_MAX_DELAY;
}

function validateInitialDelay(delay) {
	if (Number.isInteger(delay) && delay > 0) {
		return delay;
	}
	return DEFAULT_INITIAL_DELAY;
}

function validateMultiplier(mult) {
	if (Number.isInteger(mult) && mult >= 1) {
		return mult;
	}
	return DEFAULT_MULTIPLIER;
}

function backoff(args) {
	const retryWhen = validateRetryWhen(args.retryWhen);
	const maxRetries = validateMaxRetries(args.maxRetries);
	const maxDelay = validateMaxDelay(args.maxDelay);
	const initialDelay = validateInitialDelay(args.initialDelay);
	const multiplier = validateMultiplier(args.multiplier);

	const delay = retryAttempt =>
		// eslint-disable-next-line no-restricted-properties
		Math.min(initialDelay * Math.pow(multiplier, (retryAttempt - 1)), maxDelay);

	return this
		.retryWhen((errors) => {
			let retryAttempt = 0;

			return errors
				.mergeMap((err) => {
					retryAttempt += 1;

					if (retryWhen(err) && retryAttempt <= maxRetries) {
						return Observable.of(err);
					}
					return Observable.throw(err);
				})
				.delayWhen(() => Observable.timer(delay(retryAttempt)));
		});
}

Observable.prototype.backoff = backoff;
