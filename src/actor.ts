import * as _ from 'lodash';
import {p5js as p} from './protospawn';
import Mech from './mech';

class Actor {
    pos: p5.Vector = p.vector(-10, -10);
    vel: p5.Vector = p.vector();
    angle = 0;
    speed = 0;
    ticks = 0;
    size: number = 5;
    prevSize: number = this.size;
    width = 5;
    height = 5;
    mechs: any[] = [];
    testCollision = (other: Actor) =>
        p.collideRectRect
            (this.pos.x - this.width / 2, this.pos.y - this.height / 2, this.width, this.height,
            other.pos.x - other.width / 2, other.pos.y - other.height / 2, other.width, other.height);
    draw = () => p.rect
        (this.pos.x - this.width / 2, this.pos.y - this.height / 2, this.width, this.height);

    generator: any;
    waitingTicks = 0;
    isAlive = true;
    removeIfOut = new Mech.ScreenPos.Remove().set({ padding: 100 });
    group: Actor.Group;

    remove() {
        this.isAlive = false;
    }

    set(json: any) {
        p.setFromJsonToObj(this, json);
        return this;
    }

    constructor(public name: string) {
        _.forEach(Actor.groups, (group) => {
            if (group.name === name) {
                this.group = group;
                return false;
            }
        })
        if (!this.group) {
            this.group = new Actor.Group(name);
            Actor.groups[name] = this.group;
        }
        this.group.actors.push(this);
    }

    postUpdate() {
        if (this.prevSize != this.size) {
            this.width = this.height = this.size;
            this.prevSize = this.size;
        }
        this.removeIfOut.update(this);
        if (this.draw != null) {
            this.draw();
        }
        _.forEach(this.mechs, (m) => {
            if (typeof m === 'function') {
                m();
            } else {
                m.update(this);
            }
        });
        this.pos.add(this.vel).add(p.vectorFromAngle(this.angle).mult(this.speed));
        this.ticks++;
    }
}

module Actor {
    export function get(name: string | string[]): Actor[] {
        if (_.isArray(name)) {
            return _.reduce(name, (p: Actor[], n: string) => {
                let g = groups[n];
                if (g != null) {
                    p = p.concat(g.actors);
                }
                return p;
            }, []);
        } else {
            let g = groups[name];
            return g == null ? [] : g.actors;
        }
    }

    export let groups: any = {};

    export function clear() {
        groups = {};
    }

    export function update() {
        _.forOwn(groups, (g) => g.update());
    }

    export class Group {
        actors: Actor[];

        constructor(public name: string) {
            this.clear();
        }

        clear() {
            this.actors = [];
        }

        update() {
            for (let i = 0; i < this.actors.length;) {
                const actor = this.actors[i];
                if (actor.isAlive) {
                    actor.waitingTicks--;
                    if (actor.waitingTicks <= 0 && actor.generator != null) {
                        const gn = actor.generator.next();
                        const wt = gn.value;
                        if (wt != null) {
                            actor.waitingTicks = wt;
                        } else {
                            actor.waitingTicks = 1;
                        }
                    }
                }
                if (actor.isAlive) {
                    actor.postUpdate();
                    i++;
                } else {
                    this.actors.splice(i, 1);
                }
            }
        }
    }
}
export default Actor;
