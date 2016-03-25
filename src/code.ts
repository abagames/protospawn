import {protoSpawn as ps, p5js as p, mech as m} from './protospawn';
import Actor from './actor';

function setPsCode() {
    ps.main = function*() {
        ps.ship({isPlayer: true, pos: {x: 50}});
        ps.ship({isPlayer: false});
    }
    ps.ship = function*(prop) {
        this.set(prop);
        let barrier = ps.barrier(this);
        let barrierSensor = ps.barrierSensor(this);
        this.isNearBullet = false;
        let avatarMoveDirection = new m.AvatarMove.Direction().set({isVertical: false});
        let baseSpeed = 2;
        let changeAvatarSpeed = this.isPlayer ?
            (ratio) => {
                avatarMoveDirection.speed = baseSpeed * ratio;
            } :
            (ratio) => {
                this.speed = baseSpeed * ratio;
            };
        let button1Flip = new m.Random.Flip().set({probability: 0.1});
        let button2Flip = new m.Random.Flip().set({toTrueProbability: 0.02, toFalseProbability: 0.1});
        let fireAngle = this.isPlayer ? -p.HALF_PI : p.HALF_PI;
        this.weaponType = p.randomInt(0, 2);
        let existsWeapon = (name) => _.some(Actor.get(name), (a: any) => a.isPlayer === this.isPlayer);
        this.shield = 100;
        this.set({size: 7, collisionSizeRatio: 0.7, mechs: [
            new m.Collision.Test().set({name: ['bullet', 'explosion', 'laser', 'missile'], do: (s, o) => {
                if (this.isPlayer === o.isPlayer) {
                    return;
                }
                let damage = {bullet: 20, explosion: 3, laser : 2, missile: 10};
                s.shield -= damage[o.name];
                if (o.name === 'bullet' || o.name === 'missile') {
                    o.remove();
                }
                if (s.shield <= 0) {
                    if (s.remove()) {
                        barrier.remove();
                        barrierSensor.remove();
                        if (this.isPlayer) {
                            ps.delaySpawn(30, ps.ship, {isPlayer: this.isPlayer, pos: {x: this.pos.x}});
                        } else {
                            ps.delaySpawn(30, ps.ship, {isPlayer: this.isPlayer});
                        }
                    }
                }
            }}),
            new m.Event.Frame().set({do: () => {
                if (this.isPlayer) {
                    this.isButton1Down = p.isKeyDown(p.Key.button1);
                    this.isButton2Down = p.isKeyDown(p.Key.button2) || p.isKeyDown(p.Key.button3);
                } else {
                    this.isButton1Down = button1Flip.value;
                    this.isButton2Down = button2Flip.value;
                }
                if (!existsWeapon('exploder') &&
                    !existsWeapon('laserTurret') &&
                    !existsWeapon('missileTurret') &&
                    !this.isButton1Down && !this.isButton2Down && this.isNearBullet) {
                    changeAvatarSpeed(0.5);
                    barrier.isVisible = true;
                } else {
                    if (!existsWeapon('laserTurret')) {
                        changeAvatarSpeed(1);
                    }
                    barrier.isVisible = false;
                }
                this.isNearBullet = false;
                if (this.isPlayer) {
                    p.rect(0, 97, this.shield, 1);
                } else {
                    p.rect(0, 2, this.shield, 1);
                }
                this.shield = p.clamp(this.shield + 0.1, 0, 100);
            }}),
            new m.Event.Resource().set({count: 5, cond: () => this.isButton1Down, do: () => {
                ps.bullet({pos: this.pos, angle: fireAngle, isPlayer: this.isPlayer});
            }}),
            new m.Event.Resource().set({cond: () => this.isButton2Down, do: () => {
                switch (this.weaponType) {
                    case 0:
                        if (!existsWeapon('exploder')) {
                            ps.exploder({pos: this.pos, angle: fireAngle, isPlayer: this.isPlayer});
                        }
                        break;
                    case 1:
                        if (!existsWeapon('laserTurret')) {
                            ps.laserTurret(this, changeAvatarSpeed);
                        }
                        break;
                    case 2:
                        if (!existsWeapon('missileTurret')) {
                            let target = _.filter(Actor.get('ship'),  (a: any) => a.isPlayer !== this.isPlayer);
                            if (target.length > 0 && target[0].isAlive) {
                                ps.missileTurret(this, target[0]);
                            }
                        }
                        break;
                }
            }})
        ]});
        if (this.isPlayer) {
            this.pos.y = 90;
            this.mechs = this.mechs.concat([
                avatarMoveDirection,
                new m.EndOfScreen.Clamp(),
                new m.AvatarInput.KeyPressed().set({key: p.Key.button3,
                    do: () => this.weaponType = p.wrap(this.weaponType + 1, 0, 3)})
            ]);
        } else {
            this.pos.x = p.random(10, 90);
            this.pos.y = 10;
            this.angle = p.randomInt() * p.PI;
            this.mechs = this.mechs.concat([
                button1Flip, button2Flip,
                new m.Event.Random().set({probability: 0.02, do: () => this.angle += p.PI }),
                new m.Move.LimitAngle().set({count: 2, isVertical: true}),
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
    ps.barrierSensor = function*(parent) {
        this.size = 50;
        this.draw = () => {};
        this.pos = parent.pos;
        this.isPlayer = parent.isPlayer;
        this.mechs = [
            new m.Collision.Test().set({name: 'bullet', do: (s, o) => {
                if (this.isPlayer != o.isPlayer) {
                    parent.isNearBullet = true;
                }
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
    ps.laserTurret = function*(parent, changeAvatarSpeed) {
        this.isVisible = false;
        this.isPlayer = parent.isPlayer;
        let size = 0.5;
        for (let i = 0; i < 10; i++) {
            ps.laser(parent, size);
            changeAvatarSpeed(1 - i * 0.09);
            yield;
        }
        for (let i = 0; i < 20 ; i++) {
            if (i < 10) {
                size += 0.2;
            }
            ps.laser(parent, size);
            changeAvatarSpeed(0.1);
            yield;
        }
        for (let i = 0; i < 10 ; i++) {
            ps.laser(parent, size);
            size -= 0.2;
            yield;
        }
        for (let i = 0; i < 10 ; i++) {
            changeAvatarSpeed(0.1 + i * 0.09);
            yield;
        }
        this.remove();
    }
    ps.laser = function*(parent, size) {
        this.pos.set(parent.pos);
        this.isPlayer = parent.isPlayer;
        this.vel.x = p.random(-size * 2, size * 2);
        this.vel.y = parent.isPlayer ? -2 : 2;
        this.stroke = 'cyan';
        this.bsize = size;
        this.mechs = [
            new m.Event.Frame().set({do: () => {
                this.bsize *= 1.05;
                this.width = this.bsize / 2;
                this.height = this.bsize * 2;
                this.vel.x *= 0.7;
                this.vel.y *= 1.05;
            }}),
            new m.Move.ChaseOffset().set({target: parent, isVertical: false})
        ];       
    }
    ps.missileTurret = function*(parent, target){
        this.isVisible = false;
        this.isPlayer = parent.isPlayer;
        ps.missile(parent, target);
        yield 7;
        ps.missile(parent, target);
        yield 7;
        ps.missile(parent, target);
        yield 7;
        this.remove();
    }
    ps.missile = function*(parent, target) {
        this.pos.set(parent.pos);
        this.isPlayer = parent.isPlayer;
        this.vel.x = p.random(-1, 1);
        this.stroke = 'green';
        this.mechs = [
            new m.Move.ChaseVel().set({target: target}),
            new m.EndOfScreen.Remove()
        ]
    }
}
export default setPsCode;
