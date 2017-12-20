# rxjs-backoff
Add retries to your promises when using rxjs.
## Getting Started
```shell
npm install --save rxjs-backoff
```

```javascript
const backoff = require('rxjs-backoff');

// Mock failing http request
const httpRequest = () => new Promise((res, rej) => {
	setTimeout(() => rej({ statusCode: 500 }), 1000);
});

const obs = backoff({
		promise: () => httpRequest(),
		retryWhen: err => err.statusCode >= 500,
		initialDelay: 200,
		maxDelay: 1000,
		maxRetries: 5,
		multiplier: 2,
	})
	// Do something with the result
	.pluck('body');

obs.subscribe(body => console.log(body));
```
