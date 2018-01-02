'use strict';

const ObjectTransfrom = require('./ObjectTransform');

module.exports = class PassthroughStream extends ObjectTransfrom {
	_transform(doc, enc, next) {
		next(null, doc);
	}
};
