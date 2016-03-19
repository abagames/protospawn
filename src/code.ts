import {protoSpawn as ps, p5js as p, mech as m} from './protospawn';

function setPsCode() {
    ps.main = function*() {
        this.set({mechs: [
            new m.Condition.LimitActorCount().set({name: ['exploderPly', 'exploderEnm']})
        ]});
        ps.ship({rename: 'shipPly', pos: {x: 50}});
        ps.ship({raname: 'shipEnm'});
    }
    ps.ship = function*(prop) {
        let isPlayer = this.name === 'shipPly';
        this.set(prop);
        let bulletName = isPlayer ? 'bulletPly' : 'bulletEnm';
        let fireAngle = isPlayer ? -p.HALF_PI : p.HALF_PI;
        let exploderName = isPlayer ? 'exploderPly' : 'exploderEnm';
        let colBulletName = isPlayer ? 'bulletEnm' : 'bulletPly';
        let barrier = ps.barrier(this);
        let barrierSensor = ps.barrierSensor(this, colBulletName);
        this.isNearBullet = false;
        let avatarMoveDirection = new m.AvatarMove.Direction().set({isVertical: false});
        let button1Flip = new m.Random.Flip().set({probability: 0.1});
        let button2Flip = new m.Random.Flip().set({toTrueProbability: 0.02, toFalseProbability: 0.1});
        this.set({baseSpeed: 2, size: 7, collisionSizeRatio: 0.7, mechs: [
            new m.Collision.Test().set({name: [colBulletName, 'explosion'], do: (s, o) => {
                if (s.remove()) {
                    barrier.remove();
                    barrierSensor.remove();
                    if (isPlayer) {
                        ps.delaySpawn(30, ps.ship, {rename: 'shipPly', pos: {x: this.pos.x}});
                    } else {
                        ps.delaySpawn(30, ps.ship, {raname: 'shipEnm'});
                    }
                }
            }}),
            new m.Event.Frame().set({do: () => {
                if (isPlayer) {
                    this.isButton1Down = p.isKeyDown(p.Key.button1);
                    this.isButton2Down = p.isKeyDown(p.Key.button2);
                } else {
                    this.isButton1Down = button1Flip.value;
                    this.isButton2Down = button2Flip.value;
                }
                if (!this.isButton1Down && !this.isButton2Down && this.isNearBullet) {
                    if (isPlayer) {
                        avatarMoveDirection.speed = this.baseSpeed * 0.5;
                    } else {
                        this.speed = this.baseSpeed * 0.5;
                    }
                    barrier.isVisible = true;
                } else {
                    if (isPlayer) {
                        avatarMoveDirection.speed = this.baseSpeed;
                    } else {
                        this.speed = this.baseSpeed;
                    }
                    barrier.isVisible = false;
                }
                this.isNearBullet = false;
            }}),
            new m.Event.Resource().set({count: 5, cond: () => this.isButton1Down, do: () => {
                ps.bullet({pos: this.pos, angle: fireAngle, rename: bulletName});
            }}),
            new m.Event.Resource().set({cond: () => this.isButton2Down, do: () => {
                ps.exploder({pos: this.pos, angle: fireAngle, rename: exploderName});
            }})
        ]});
        if (isPlayer) {
            this.pos.y = 90;
            this.mechs = this.mechs.concat([
                avatarMoveDirection,
                new m.EndOfScreen.Clamp(),
            ]);
        } else {
            this.pos.x = p.random(10, 90);
            this.pos.y = 10;
            this.angle = p.randomInt() * p.PI;
            this.mechs = this.mechs.concat([
                button1Flip, button2Flip,
                new m.Event.Random().set({probability: 0.02, do: () => this.angle += p.PI }),
                new m.EndOfScreen.ReflectAngle()
            ]);
        }
    }
    ps.barrier = function*(parent) {
        this.size = 15;
        this.collisionSizeRatio = 1.5;
        this.fill = 'rgba(0, 0, 0, 0)';
        this.pos = parent.pos;
    }
    ps.barrierSensor = function*(parent, bulletName) {
        this.size = 50;
        this.draw = () => {};
        this.pos = parent.pos;
        this.mechs = [
            new m.Collision.Test().set({name: bulletName, do: (s, o) => {
                parent.isNearBullet = true;
            }})
        ];
    }
    ps.bullet = function*(prop) {
        this.set(prop);
        this.speed = this.size = 3;
        this.mechs = [
            new m.Collision.TestAndRemove().set({name: ['explosion', 'barrier']})
        ];
    }
    ps.exploder = function*(prop) {
        this.set(prop);
        this.stroke = 'magenta';
        this.speed = 5;
        for (let i = 0; i < 30; i++) {
            this.speed *= 0.94;
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
