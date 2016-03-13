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
        this.set({pos: {x, y: 90}, size: 7, mechs: [
            new m.AvatarMove.Direction().set({speed: 2, isVertical: false}),
            new m.ScreenPos.Clamp(),
            new m.Collision.Test().set({name: ['bulletEnm', 'explosion'], do: (s, o) => {
                s.remove();
                ps.delaySpawn(30, ps.ply, [this.pos.x]);
            }}),
            new m.AvatarInput.ButtonPressed().set({do: () => {
                ps.bullet({pos: this.pos, angle: -p.HALF_PI, name: 'bulletPly'});
                ps.exploder({pos: this.pos, vel: {y: -5}, name: 'exploderPly'});
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
            new m.ScreenPos.Bounce(),
            new m.Collision.Test().set({name: ['bulletPly', 'explosion'], do: (s, o) => {
                s.remove();
                ps.delaySpawn(30, ps.enm)
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
