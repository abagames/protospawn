import * as _ from 'lodash';
declare const require: any;
let p5 = require('p5');
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
        export class ButtonPressed extends Mech {
            do: (a: Actor) => void;
            isPressed = false;

            update(a: Actor) {
                if (p.isKeysDown(p.keyCodes.button)) {
                    if (!this.isPressed) {
                        this.isPressed = true;
                        this.do(a);
                    }
                } else {
                    this.isPressed = false;
                }
            }
        }
    }

    export module ScreenPos {
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

        export class Bounce extends Mech {
            update(a: Actor) {
                if ((a.pos.x < 0 && a.vel.x < 0) || (a.pos.x > p.width && a.vel.x > 0)) {
                    a.vel.x *= -1;
                }
                if ((a.pos.y < 0 && a.vel.y < 0) || (a.pos.y > p.height && a.vel.y > 0)) {
                    a.vel.y *= -1;
                }
            }
        }
    }

    export module Event {
        export class Random extends Mech {
            probability = 0.01;
            do: (a: Actor) => void;

            update(a: Actor) {
                if (p.random() <= this.probability) {
                    this.do(a);
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
                    if (a.testCollision(other)) {
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