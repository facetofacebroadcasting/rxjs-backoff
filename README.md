# rxjs-backoff
Exponential backoff operator for rxjs  

## Getting Started
#### Installation
```shell
npm install --save rxjs-backoff

# Rxjs is required as a peer dependency
npm install --save rxjs
```

#### Usage
```javascript
require('rxjs');
require('rxjs-backoff');
const { Observable } = require('rxjs/Observable');

// Mock failing http request
const httpRequest = () => new Promise((res, rej) => {
	setTimeout(() => rej({ statusCode: 500 }), 1000);
});

const obs = Observable
	.defer(() => httpRequest())
	.backoff({
		retryWhen: err => err.statusCode >= 500,
		initialDelay: 200,
		maxDelay: 1000,
		maxRetries: 5,
		multiplier: 2,
	})
	// Do something with the result
	.pluck('body');

obs.subscribe(body => console.log(body), err => console.log(err.statusCode));
```
