function p5Util(p5, p: p5) {
    p5.prototype.vector = function(x: number = 0, y: number = 0) {
        return new p5.Vector(x, y);
    }
    p5.prototype.vectorFromAngle = function(angle: number): p5.Vector {
        return p5.Vector.fromAngle(angle);
    }
    p5.prototype.angleBetween = function(v1: p5.Vector, v2: p5.Vector): number {
        return p5.Vector.angleBetween(v1, v2);
    }
    p5.prototype.randomInt = function(min: number = 0, max: number = 1) {
        return Math.floor(p.random(0, max + 1));
    }
    p5.prototype.randomPlusMinus = function() {
        return p.randomInt(0, 1) * 2 - 1;
    }
    p5.prototype.clamp = function(v: number, min: number = 0, max: number = 1): number {
        if (v < min) {
            return min;
        } else if (v > max) {
            return max;
        } else {
            return v;
        }
    }
    p5.prototype.wrap = function(v: number, min: number = 0, max: number = 1): number {
        let w = max - min;
        let o = v - min;
        if (o >= 0) {
            return o % w + min;
        } else {
            return w + o % w + min;
        }
    }
    p5.prototype.normalizeAngle = function(v: number): number {
        return p.wrap(v, -p.PI, p.PI);
    }
    p5.prototype.isIn = function(v: number, min: number = 0, max: number = 1, padding: number = 0): boolean {
        return (v >= min - padding && v <= max + padding);
    }
    const button1KeyCodes = [90, 191, 32, 13];
    const button2KeyCodes = [88, 190, 17];
    const button3KeyCodes = [67, 188, 16];
    const button4KeyCodes = [86, 77];
    const buttonKeyCodes = button1KeyCodes.
        concat(button2KeyCodes).concat(button3KeyCodes).concat(button4KeyCodes);
    p5.prototype.Key = {
        up: [38, 87, 73, 104],
        right: [39, 68, 76, 102],
        down: [40, 83, 75, 101, 98],
        left: [37, 65, 74, 100],
        button1: button1KeyCodes,
        button2: button2KeyCodes,
        button3: button3KeyCodes,
        button4: button4KeyCodes,
        button: buttonKeyCodes,
        pause: [80, 27]
    };
    p5.prototype.getStick = function(): p5.Vector {
        let stick = new p5.Vector();
        if (p.isKeysDown(p.Key.up)) {
            stick.y = -1;
        }
        if (p.isKeysDown(p.Key.right)) {
            stick.x = 1;
        }
        if (p.isKeysDown(p.Key.down)) {
            stick.y = 1;
        }
        if (p.isKeysDown(p.Key.left)) {
            stick.x = -1;
        }
        return stick;
    }
    p5.prototype.isKeysDown = function(keyCodes: number[]): boolean {
        return _.some(keyCodes, (kc: number) => p.keyIsDown(kc));
    }
    p5.prototype.setFromJsonToObj = function(obj: any, json: any, deepCount = 0) {
        for (let prop in json) {
            if (typeof json[prop] === 'object' && obj[prop] != null && deepCount < 5) {
                p.setFromJsonToObj(obj[prop], json[prop], deepCount + 1);
            } else {
                obj[prop] = json[prop];
            }
        }
    }

    p5.Vector.prototype.clamp = function(minX: number = 0, maxX: number = 1,
        minY: number = null, maxY: number = null) {
        if (minY == null) {
            minY = minX;
        }
        if (maxY == null) {
            maxY = maxX;
        }
        this.x = p.clamp(this.x, minX, maxX);
        this.y = p.clamp(this.y, minY, maxY);
    }
    p5.Vector.prototype.wrap = function(minX: number = 0, maxX: number = 1,
        minY: number = null, maxY: number = null) {
        if (minY == null) {
            minY = minX;
        }
        if (maxY == null) {
            maxY = maxX;
        }
        this.x = p.wrap(this.x, minX, maxX);
        this.y = p.wrap(this.y, minY, maxY);
    }
    p5.Vector.prototype.isIn = function(minX: number = 0, maxX: number = 1,
        minY: number = null, maxY: number = null, padding: number = 0) {
        if (minY == null) {
            minY = minX;
        }
        if (maxY == null) {
            maxY = maxX;
        }
        return (p.isIn(this.x, minX, maxX, padding) && p.isIn(this.y, minY, maxY, padding));
    }
}
export default p5Util;
