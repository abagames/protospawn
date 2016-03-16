import {protoSpawn as ps, p5js as p, mech as m} from './protospawn';

function setPsCode() {
    ps.main = function* () {
        this.set({mechs: [
            new m.Condition.LimitActorCount().set({name: ['exploderPly', 'exploderEnm']})
        ]});
        ps.ply();
        ps.enm();
    }
    ps.ply = function*(x = 50) {
        this.set({pos: {x, y: 90}, baseSpeed: 2, size: 7, mechs: [
            new m.AvatarMove.Direction().set({isVertical: false}),
            new m.EndOfScreen.Clamp(),
            new m.Collision.Test().set({name: ['bulletEnm', 'explosion'], do: (s, o) => {
                if (s.remove()) {
                    ps.delaySpawn(30, ps.ply, [this.pos.x]);
                }
            }}),
            new m.AvatarInput.KeyDown().set({key: p.Key.button2, interval: 5, do: () => {
                ps.bullet({pos: this.pos, angle: -p.HALF_PI, name: 'bulletPly'});
            }}),
            new m.AvatarInput.KeyPressed().set({key: p.Key.button3, do: () => {
                ps.exploder({pos: this.pos, vel: {y: -5}, name: 'exploderPly'});
            }}),
            new m.Event.Frame().set({do: () => {
                if (p.isKeysDown(p.Key.button1)) {
                    this.mechs[0].speed = this.baseSpeed * 0.5;
                } else {
                    this.mechs[0].speed = this.baseSpeed;
                }
            }})
        ]});
    }
    ps.enm = function*() {
        this.set({
            pos: {x: p.random(0, 100), y: 10}, 
            vel: {x: p.randomPlusMinus() * 2, y: 0}, 
            size: 7, 
            mechs: [
            new m.Event.Random().set({probability: 0.02, do: (a) => a.vel.x *= -1 }),
            new m.EndOfScreen.Bounce(),
            new m.Collision.Test().set({name: ['bulletPly', 'explosion'], do: (s, o) => {
                if (s.remove()) {
                    ps.delaySpawn(30, ps.enm)
                }
            }}),
            new m.Event.Random().set({probability: 0.05, do: (a) => {
                ps.bullet({pos: this.pos, angle: p.HALF_PI, name: 'bulletEnm'});
                ps.exploder({pos: this.pos, vel: {y: 5}, name: 'exploderEnm'});
            }}),
        ]});
    }
    ps.bullet = function*(prop) {
        this.set(prop);
        this.speed = this.size = 3;
        this.mechs = [
            new m.Collision.TestAndRemove().set({name: 'explosion'})
        ];
    }
    ps.exploder = function*(prop) {
        this.set(prop);
        for (let i = 0; i < 30; i++) {
            this.vel.y *= 0.94;
            yield;
        }
        ps.explosion({pos: this.pos});
        this.remove();
    }
    ps.explosion = function*(prop) {
        this.set(prop);
        this.stroke = 'red';
        for (let i = 0; i < 15; i++) {
            this.size += 2;
            yield;
        }
        for (let i = 0; i < 15; i++) {
            this.size -= 2;
            yield;
        }
        this.remove();
    }
}
export default setPsCode;
