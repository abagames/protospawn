import * as _ from 'lodash';
declare const require: any;
const p5 = require('p5');
import {p5js as p} from './protospawn';
import Actor from './actor';

abstract class Mech {
    abstract update(a: Actor);

    set(json: any) {
        p.setFromJsonToObj(this, json);
        return this;
    }
}

module Mech {
    export module AvatarMove {
        export class Direction extends Mech {
            speed = 1;
            isHorizontal = true;
            isVertical = true;

            update(a: Actor) {
                let s = p.getStick();
                if (!this.isHorizontal) {
                    s.x = 0;
                }
                if (!this.isVertical) {
                    s.y = 0;
                }
                a.vel = s.mult(this.speed);
            }
        }

        export class Rotation extends Mech {
            speed = 1;
            angleSpeed = 1;

            update(a: Actor) {
                this.move(a, p.getStick());
            }

            move(a: Actor, s: p5.Vector) {
                a.angle += s.x * this.angleSpeed;
                a.speed = -s.y * this.speed;
            }
        }
    }

    export module AvatarInput {
        export class KeyDown extends Mech {
            key = p.Key.button;
            do: (a: Actor) => void;
            interval: number = 1;
            ticks = 0;

            update(a: Actor) {
                if (p.isKeyDown(this.key)) {
                    this.ticks--;
                    if (this.ticks <= 0) {
                        this.do(a);
                        this.ticks = this.interval;
                    }
                }
            }
        }

        export class KeyUp extends Mech {
            key = p.Key.button;
            do: (a: Actor) => void;
            interval: number = 1;
            ticks = 0;

            update(a: Actor) {
                if (!p.isKeyDown(this.key)) {
                    this.ticks--;
                    if (this.ticks <= 0) {
                        this.do(a);
                        this.ticks = this.interval;
                    }
                }
            }
        }

        export class KeyPressed extends Mech {
            key: number[] = p.Key.button;
            do: (a: Actor) => void;
            isPressed = false;

            update(a: Actor) {
                if (p.isKeyDown(this.key)) {
                    if (!this.isPressed) {
                        this.isPressed = true;
                        this.do(a);
                    }
                } else {
                    this.isPressed = false;
                }
            }
        }

        export class KeyReleased extends Mech {
            key = p.Key.button;
            do: (a: Actor) => void;
            isPressed = false;

            update(a: Actor) {
                if (p.isKeyDown(this.key)) {
                    this.isPressed = true;
                } else {
                    if (this.isPressed) {
                        this.isPressed = false;
                        this.do(a);
                    }
                }
            }
        }
    }
    
    export module Move {
        export class Chase extends Mech {
            target: Actor;
            ratio = 1;
            isVertical = true;
            isHorizontal = true;
            
            update(a: Actor) {
                if (this.isHorizontal) {
                    a.pos.x += (this.target.pos.x - a.pos.x) * this.ratio;
                }
                if (this.isVertical) {
                    a.pos.y += (this.target.pos.y - a.pos.y) * this.ratio;
                }
            }
        }
        
        export class LimitAngle extends Mech {
            count = 4;
            isVertical = false;
            
            update(a: Actor) {
                let angleWidth = p.TWO_PI /  this.count;
                let startAngle = this.isVertical ? 0 : p.HALF_PI;
                let aa = p.normalizeAngle(a.angle - startAngle + angleWidth / 2, true);
                a.angle = Math.floor(aa / angleWidth) * angleWidth + startAngle;
            }
        }
    }

    export module EndOfScreen {
        export class Clamp extends Mech {
            update(a: Actor) {
                a.pos.clamp(0, p.width, 0, p.height);
            }
        }

        export class Remove extends Mech {
            padding = 10;

            update(a: Actor) {
                if (!a.pos.isIn(0, p.width, 0, p.height, this.padding)) {
                    a.remove();
                }
            }
        }

        export class BounceVel extends Mech {
            update(a: Actor) {
                if ((a.pos.x < 0 && a.vel.x < 0) || (a.pos.x > p.width && a.vel.x > 0)) {
                    a.vel.x *= -1;
                }
                if ((a.pos.y < 0 && a.vel.y < 0) || (a.pos.y > p.height && a.vel.y > 0)) {
                    a.vel.y *= -1;
                }
            }
        }

        export class ReflectAngle extends Mech {
            update(a: Actor) {
                let normAngle: number = null;
                if (a.pos.x < 0) {
                    normAngle = 0;
                }
                if (a.pos.x > p.width) {
                    normAngle = p.PI;
                }
                if (a.pos.y < 0) {
                    normAngle = p.HALF_PI;
                }
                if (a.pos.y > p.height) {
                    normAngle = -p.HALF_PI;
                }
                if (normAngle == null) {
                    return;
                }
                let oa = p.normalizeAngle(a.angle - normAngle);
                if (Math.abs(oa) <= p.HALF_PI) {
                    return;
                }
                a.angle += oa;
            }
        }
    }

    export module Event {
        export class Frame extends Mech {
            interval = 1;
            do: (a: Actor) => void;
            ticks = 0;

            update(a: Actor) {
                this.ticks--;
                if (this.ticks <= 0) {
                    this.do(a);
                    this.ticks = this.interval;
                }
            }
        }

        export class Random extends Mech {
            probability = 0.01;
            do: (a: Actor) => void;

            update(a: Actor) {
                if (p.random() <= this.probability) {
                    this.do(a);
                }
            }
        }

        export class Resource extends Mech {
            count = 1;
            do: (a: Actor) => void;
            cond = () => true;
            current = 0;

            update(a: Actor) {
                this.current--;
                if (this.current <= 0 && this.cond()) {
                    this.do(a);
                    this.current = this.count;
                }
            }
        }
    }

    export module Random {
        export class Flip extends Mech {
            value = false;
            probability = 0.1;
            toTrueProbability: number = null;
            toFalseProbability: number = null;

            update(a: Actor) {
                let r = p.random();
                if (this.value) {
                    if (this.toFalseProbability != null) {
                        if (r < this.toFalseProbability) {
                            this.value = false;
                        }
                    } else if (p.random() <= this.probability) {
                        this.value = false;
                    }
                } else {
                    if (this.toTrueProbability != null) {
                        if (r < this.toTrueProbability) {
                            this.value = true;
                        }
                    } else if (p.random() <= this.probability) {
                        this.value = true;
                    }
                }
            }
        }
    }

    export module Collision {
        export class Test extends Mech {
            name: string | string[];
            do: (self: Actor, other: Actor) => void;

            update(a: Actor) {
                let others = Actor.get(this.name);
                _.forEach(others, (other: Actor) => {
                    if (a != other && a.isVisible && other.isVisible && a.testCollision(other)) {
                        this.do(a, other);
                    }
                });
            }
        }

        export class TestAndRemove extends Test {
            constructor() {
                super();
                this.do = (self, other) => self.remove();
            }
        }

        export class TestAndRemoveOther extends Test {
            constructor() {
                super();
                this.do = (self, other) => other.remove();
            }
        }

        export class TestAndRemoveBoth extends Test {
            constructor() {
                super();
                this.do = (self, other) => {
                    self.remove();
                    other.remove();
                };
            }
        }
    }

    export module Condition {
        export class LimitActorCount extends Mech {
            name: string | string[];
            max = 1;

            update(a: Actor) {
                _.forEach(_.isArray(this.name) ? this.name : [this.name],
                    (n) => Actor.get(n).splice(this.max));
            }
        }
    }
}
export default Mech;