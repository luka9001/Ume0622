'use strict';

const EventEmitter = require('events');
// import { EventEmitter } from "events";
class CountEmitter extends EventEmitter { }

const SingleCountEmitter = new CountEmitter();

export default SingleCountEmitter;
