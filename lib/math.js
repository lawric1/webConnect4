export class Vector2 {
    static ZERO = new Vector2(0, 0);
    static ONE = new Vector2(1, 1);
    static LEFT = new Vector2(-1, 0);
    static RIGHT = new Vector2(1, 0);
    static UP = new Vector2(0, -1);
    static DOWN = new Vector2(0, 1);

    constructor(x = 0, y = 0) {
        this.x = x;
        this.y = y;
    }

    add(vector) {
        return new Vector2(this.x + vector.x, this.y + vector.y);
    }
    subtract(vector) {
        return new Vector2(this.x - vector.x, this.y - vector.y);
    }
    multiply(scalar) {
        return new Vector2(this.x * scalar, this.y * scalar);
    }
    divide(scalar) {
        return new Vector2(this.x / scalar, this.y / scalar);
    }
    dot(vector) {
        return this.x * vector.x + this.y * vector.y;
    }
    magnitude() {
        return Math.sqrt(this.x * this.x + this.y * this.y);
    }
    normalize() {
        const mag = this.magnitude();
        return new Vector2(this.x / mag, this.y / mag);
    }
    distanceTo(vector) {
        const dx = this.x - vector.x;
        const dy = this.y - vector.y;
        return Math.sqrt(dx * dx + dy * dy);
    }
    squaredDistanceTo(vector) {
        const dx = this.x - vector.x;
        const dy = this.y - vector.y;
        return dx * dx + dy * dy;
    }
    static fromAngle(angle) {
        const x = Math.cos(angle);
        const y = Math.sin(angle);
        return new Vector2(x, y);
    }
    toAngle() {
        return Math.atan2(this.y, this.x);
    }
    snapToPixel() {
        this.x = Math.round(this.x);
        this.y = Math.round(this.y);
    }
    clone() {
        return new Vector2(this.x, this.y);
    }
    toString() {
        return `\nVector2 -> ${this.x}, ${this.y}`;
    }
}

export function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
}

export function mapValue(value, oldMin, oldMax, newMin, newMax) {
    // Ensure the value is within the original range
    value = Math.max(Math.min(value, oldMax), oldMin);

    // Map the value to the new range
    const oldRange = oldMax - oldMin;
    const newRange = newMax - newMin;
    const mappedValue = ((value - oldMin) / oldRange) * newRange + newMin;

    return mappedValue;
}
export function toRadians(degrees) {
    return degrees * (Math.PI / 180);
}
export function toDegree(radians) {
    return radians * (180 / Math.PI);
}
export function randomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}
export function randomFloat(min, max) {
    return Math.random() * (max - min) + min;
}
export function lerp(start, end, t, easing = "easeInOutSine") {
    if (easing === "easeInSine") { t = easeInSine(t); }
    if (easing === "easeOutSine") { t = easeOutSine(t); }
    if (easing === "easeInOutSine") { t = easeInOutSine(t); }
    if (easing === "easeInCubic") { t = easeInCubic(t); }
    if (easing === "easeOutCubic") { t = easeOutCubic(t); }
    if (easing === "easeInOutCubic") { t = easeInOutCubic(t); }
    if (easing === "easeInElastic") { t = easeInElastic(t); }
    if (easing === "easeOutElastic") { t = easeOutElastic(t); }
    if (easing === "easeInOutElastic") { t = easeInOutElastic(t); }

    return start * (1 - t) + end * t;
}


function easeInSine(x) {
    return 1 - Math.cos((x * Math.PI) / 2);
}
function easeOutSine(x) {
    return Math.sin((x * Math.PI) / 2);
}
function easeInOutSine(x) {
    return -(Math.cos(Math.PI * x) - 1) / 2;
}
function easeInCubic(x) {
    return x * x * x;
}
function easeOutCubic(x) {
    return 1 - Math.pow(1 - x, 3);
}
function easeInOutCubic(x) {
    return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
}
function easeInElastic(x) {
    const c4 = (2 * Math.PI) / 3;
    
    return x === 0
      ? 0
      : x === 1
      ? 1
      : -Math.pow(2, 10 * x - 10) * Math.sin((x * 10 - 10.75) * c4);
}
function easeOutElastic(x) {
    const c4 = (2 * Math.PI) / 3;
    
    return x === 0
      ? 0
      : x === 1
      ? 1
      : Math.pow(2, -10 * x) * Math.sin((x * 10 - 0.75) * c4) + 1;
}
function easeInOutElastic(x) {
    const c5 = (2 * Math.PI) / 4.5;
    
    return x === 0
      ? 0
      : x === 1
      ? 1
      : x < 0.5
      ? -(Math.pow(2, 20 * x - 10) * Math.sin((20 * x - 11.125) * c5)) / 2
      : (Math.pow(2, -20 * x + 10) * Math.sin((20 * x - 11.125) * c5)) / 2 + 1;
}