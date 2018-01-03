'use strict';

const ObjectTransform = require('./ObjectTransform');

module.exports = class ParallelStream extends ObjectTransform {
	constructor(maxInFlight, workerFunc, endFunc) {
		super();

		this._maxInFlight = maxInFlight;
		this._workerFunc = workerFunc;
		this._endFunc = endFunc;

		this._resumeQueue = [];
		this._queueDepth = 0;
	}

	_transform(doc, enc, next) {
		this._queueDepth += 1;

		this._workerFunc(doc, enc, (err, docToPush) => {
			this._queueDepth -= 1;

			if (err) {
				next(err);
				return;
			}

			// don't pass `undefined` when `next(null)` is called
			if (docToPush !== undefined) this.push(docToPush);

			// check to see if we're currently blocking the stream and waiting to call `next()`
			// until a slot opens up in the queue. Since at this point a space is free, call `next()`
			if (this._resumeQueue.length > 0) {
				const resume = this._resumeQueue.pop();
				resume();
			}
		});

		// if we've reached maxInFlight, don't call `next()` right away to force upstream to pause
		// instead, queue `next` up so it can be called from the response callback
		if (this._queueDepth < this._maxInFlight) next();
		else this._resumeQueue.push(next);
	}

	_flush(callback) {
		// eslint-disable-line class-methods-use-this
		const interval = setInterval(() => {
			if (this._queueDepth === 0) {
				clearInterval(interval);

				// call the end handler if one was provided
				if (this._endFunc && typeof this._endFunc === 'function')
					this._endFunc();

				callback();
			}
		}, 100);
	}
};
