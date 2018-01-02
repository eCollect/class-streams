'use strict';

const ObjectTransform = require('./ObjectTransform');

module.exports = class FilterTransform extends ObjectTransform {
	constructor(filter) {
		super({ objectMode: true, highWaterMark: 16 });
		this._filter = filter.bind(this);
		this._index = 0;
	}

	_transform(data, enc, callback) {
		if (this._filter(data, this._index))
			this.push(data);
		this._index += 1;
		return callback();
	}
};
