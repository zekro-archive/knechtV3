/*
STRONGLY INPIRED BY
snowflake package for Go by bwmarrin
https://github.com/bwmarrin/snowflake

MIT License

Copyright (c) 2018 Ringo Hoffmann (zekro Development)

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
*/

// Epoch defaultly set to creation of this class
// (Tue Oct 23 2018 06:27:17 UTC)
const defEpoch = 1540276037951;

const nodeBits = 10;
const stepBits = 12;

const nodeMax = -1 ^ (-1 << 10);
const nodeMask = nodeMax << stepBits;
const stepMask = -1 ^ (-1 << stepBits);

const timeShift = nodeBits + stepBits;
const nodeShift = stepBits;

var epoch = defEpoch;

/**
 * Node collection of Snowflakes.
 */
class Node {
    /**
     * Create instance of Node.
     * @param {number} n Number of node 
     */
    constructor(n) {
        n = parseInt(n)
        if (!n || isNaN(n)) {
            n = 0;
        }
        if (n < 0 || n > nodeMax) {
            throw 'Node must be between 0 and ' + nodeMax;
        }
        this.time = 0;
        this.step = 0;
        this.n = n;
    }

    /**
     * Generate Snowflake.
     * @returns {number} Snowflake
     */
    next() {
        let now = Date.now();

        if (this.time == now) {
            this.step = (this.step + 1) & stepMask;
            if (this.step == 0) {
                while (now <= this.time) {
                    now = Date.now();
                }
            }
        } else {
            this.step = 0;
        }

        this.time = now;

        return (
            Math.abs((now - epoch) << timeShift) |
            Math.abs((this.node << nodeShift)) |
            (this.step)
        );
    }
}

/**
 * Set the epoch where the snowflakes time count will strat from.
 * @param {Date|number} date Epoche starting time counting from. 
 */
function setEpoch(date) {
    if (!date) {
        epoch = Date.now();
    } else if (date instanceof Date) {
        epoch = date.getTime();
    } else {
        epoch = date;
    }
}

module.exports = {
    setEpoch,
    Node
}