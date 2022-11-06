export class Reader {
    constructor(data) {
        this.offset = 0;

        this.input = data;
        this.output = {};

        this.break = false;

        this.rest = (name, after) => {
            this.output[name] = this.input.slice(this.offset, this.input.length);
            this.offset += 1;
            if (after) {
                this.output[name] = after(this.output);
            }
            return this;
        };

        this.setBreak = () => this.break = true;

        this.bytes = (name, size, after) => {
            if (this.offset >= this.input.length) {
                return;
            }
            let sz = size;
            this.output[name] = this.input.slice(this.offset, this.offset + sz);
            this.offset += sz;
            if (after) {
                this.output[name] = after(this.output);
            }
            return this;
        };

        this.string = (name, size, after = null) => {
            if (this.offset >= this.input.length) {
                return;
            }
            let sz = size(this.output);
            this.output[name] = this.input.slice(this.offset, this.offset + sz).toString();
            this.offset += sz;
            if (after) {
                this.output[name] = after(this.output);
            }
            return this;
        };

        this.nullString = (name, after = null) => {
            if (this.offset >= this.input.length) {
                return;
            }
            let sz = this.input.indexOf(0x00, this.offset) - this.offset;
            this.output[name] = this.input.slice(this.offset, this.offset + sz).toString();
            this.offset += sz + 1;
            if (after) {
                this.output[name] = after(this.output);
            }
            return this;
        };

        this.uint8 = (name, after = null) => {
            if (this.offset >= this.input.length) {
                return;
            }
            this.output[name] = this.input.readUInt8(this.offset);
            this.offset += 1;
            if (after) {
                this.output[name] = after(this.output);
            }
            return this;
        };

        this.uint16le = (name, after = null) => {
            if (this.offset >= this.input.length) {
                return;
            }
            this.output[name] = this.input.readUInt16LE(this.offset);
            this.offset += 2;
            if (after) {
                this.output[name] = after(this.output);
            }
            return this;
        };

        this.uint32le = (name, after = null) => {
            if (this.offset >= this.input.length) {
                return;
            }
            this.output[name] = this.input.readUInt32LE(this.offset);
            this.offset += 4;
            if (after) {
                this.output[name] = after(this.output);
            }
            return this;
        };

        this.uint64le = (name, after = null) => {
            if (this.offset >= this.input.length) {
                return;
            }
            this.output[name] = this.input.readBigUint64LE(this.offset);
            this.offset += 8;
            if (after) {
                this.output[name] = after(this.output);
            }
            return this;
        };

        this.if = (condition = () => {}, fulfilled = () => {}, unfulfilled = () => {}) => {
            condition(this.output) ? fulfilled(this) : unfulfilled(this);
            return this;
        };

        this.while = (condition, fulfilled) => {
            do {
                if (condition(this.output) === false || this.break) {
                    break;
                }
                fulfilled(this);
            } while (true);

            this.break = false;

            return this;
        };

        this.get = () => this.output;

        return this;
    }
}

export class Writer {
    constructor() {
        this.payload = [];

        this.uint8 = (value, offset = 0) => {
            let payload = Buffer.alloc(1);
            payload.writeUint8(value, offset);

            this.payload.push(payload);

            return this;
        };

        this.uint16le = (value, offset = 0) => {
            let payload = Buffer.alloc(2);
            payload.writeUint16LE(value, offset);

            this.payload.push(payload);

            return this;
        };

        this.uint32le = (value, offset = 0) => {
            let payload = Buffer.alloc(4);
            payload.writeUInt32LE(value, offset);

            this.payload.push(payload);

            return this;
        };

        this.uint64le = (value, offset = 0) => {
            let payload = Buffer.alloc(8);
            payload.writeBigUInt64LE(value, offset);

            this.payload.push(payload);

            return this;
        };

        this.string = (value, encoding = 'utf8') => {
            let payload = Buffer.from(value, encoding);
            this.payload.push(payload);

            return this;
        };

        this.get = () => Buffer.concat(this.payload);

        return this;
    }
}
