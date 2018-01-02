'use strict';

const { Transform } = require('stream');

module.exports = class ObjectTransform extends Transform {
	constructor() {
		super({ objectMode: true, highWaterMark: 16 });
	}
};
