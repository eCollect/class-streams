'use strict';

const { Stream } = require('stream');
const { ObjectTransform } = require('../index');
const { FilterTransform } = require('../index');
const { PassthroughStream } = require('../index')

const items = ['PassthroughStream', 'ObjectTransform', 'FilterTransform'];
const readable = new Stream.Readable({ objectMode: true });

const testObjectTransform = new ObjectTransform();
testObjectTransform._transform = (object, encoding, next) => {
    console.log(object);
    next();
}

readable
    .pipe(new PassthroughStream())
    .pipe(testObjectTransform)
	.pipe(new FilterTransform(f => true))
	.on('finish', () => {
		console.log('Test is DONE')
	});

items.forEach(item => readable.push(item));

readable.push(null);
