declare class p5 {
    width: number;
    height: number;
    mouseX: number;
    mouseY: number;
    TWO_PI: number;
    PI: number;
    HALF_PI: number;
    QUARTER_PI: number;
    LEFT_ARROW: number;
    RIGHT_ARROW: number;
    UP_ARROW: number;
    DOWN_ARROW: number;
    ESCAPE: number;
    canvas: any;

    setup();
    draw();
    createCanvas(width: number, height: number, option?: any);
    background(r: number | string, g?: number, b?: number);
    stroke(r: number | string, g?: number, b?: number);
    fill(r: number | string, g?: number, b?: number);
    noFill();
    color(r: number | string, g?: number, b?: number);
    ellipse(x: number, y: number, width: number, height: number);
    rect(x: number, y: number, width: number, height: number);
    line(x1: number, y1: number, x2: number, y2: number);
    bezier(x1: number, y1: number, x2: number, y2: number,
        x3: number, y3: number, x4: number, y4: number);
    textSize(size: number);
    text(str: string, x: number, y: number, x2?: number, y2?: number);
    textWidth(str: string): number;
    frameRate(fps: number);
    clear();
    push();
    pop();
    translate(x: number, y: number);
    rotate(angel: number);
    scale(x: number, y?: number);
    keyIsDown(code: number): boolean;
    random(min?: number, max?: number): number;
    randomSeed(seed: number);

    vector(x?: number, y?: number): p5.Vector;
    vectorFromAngle(angle: number): p5.Vector;
    angleBetween(v1: p5.Vector, v2: p5.Vector): number;

    collideRectRect(x: number, y: number, width: number, height: number,
        x2: number, y2: number, width2: number, height2: number): boolean;

    randomInt(min?: number, max?: number): number;
    randomPlusMinus(): number;
    clamp(v: number, min?: number, max?: number): number;
    wrap(v: number, min?: number, max?: number): number;
    normalizeAngle(v: number): number;
    isIn(v: number, min?: number, max?: number, padding?: number): boolean;
    Key: { up: number[], right: number[], down: number[], left: number[],
        button1: number[], button2: number[], button3: number[], button4: number[],
        button: number[] };
    getStick(): p5.Vector;
    isKeyDown(key: number[]): boolean;
    setFromJsonToObj(obj: any, json: any, deepCount?: number);
}

declare module p5 {
    class Vector {
        x: number;
        y: number;
        z: number;

        constructor(x?: number, y?: number, z?: number);
        toString(): string;
        set(x?: number | Vector | number[], y?: number, z?: number);
        copy(): Vector;
        add(x?: number | Vector | number[], y?: number, z?: number);
        sub(x?: number | Vector | number[], y?: number, z?: number);
        mult(v: number);
        div(v: number);
        mag(): number;
        magSq(): number;
        dot(x?: number | Vector | number[], y?: number, z?: number): number;
        cross(v: Vector): Vector;
        dist(v: Vector): number;
        normalize();
        limit(v: number);
        setMag(v: number);
        heading(): number;
        rotate(angle: number);
        lerp(x: number, y?: number, z?: number, amt?: number);
        array(): number[];
        equals(x?: number | Vector | number[], y?: number, z?: number): boolean;
        static fromAngle(angle: number): Vector;
        static angleBetween(v1: Vector, v2: Vector): number;

        clamp(minX?: number, maxX?: number, minY?: number, maxY?: number): number;
        wrap(minX?: number, maxX?: number, minY?: number, maxY?: number): number;
        isIn(minX?: number, maxX?: number, minY?: number, maxY?: number, padding?: number): boolean;
    }
}
