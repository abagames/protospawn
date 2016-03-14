import * as _ from 'lodash';
declare const require: any;
const p5 = require('p5');
const p5Collide = require('p5-collide2d/p5.collide2d');
import Actor from './actor';
import Mech from './mech';
import p5Util from './p5util';

declare const setPsCode: any;
import setPsCodeTs from './code';

export let protoSpawn: any;
export let p5js: p5;
export let mech = Mech;

window.onload = () => {
    new p5((_p5js: p5) => {
        p5js = _p5js;
        p5Collide(p5);
        p5Util(p5, p5js);
        p5js.setup = () => {
            protoSpawn = new Proxy({}, functionToActorHook);
            addUtilFuncs();
            if (typeof setPsCode !== 'undefined' && setPsCode != null) {
                setPsCode(protoSpawn, p5js, mech);
            }
            if (typeof setPsCodeTs !== 'undefined' && setPsCodeTs != null) {
                setPsCodeTs();
            }
            protoSpawn.main();
            const style = p5js.canvas.style;
            style.width = style.height = '75vmin';
        };
        p5js.draw = () => {
            p5js.background(245);
            Actor.update();
        };
    });
};

function addUtilFuncs() {
    protoSpawn.simple = function* (json) {
        this.set(json);
    };
    protoSpawn.delaySpawn = function* (wait, spawnFunc, args = null) {
        yield wait;
        spawnFunc.apply(this, args);
        this.remove();
    };
}

const functionToActorHook = {
    get: function(target, name) {
        const targetObj = target[name];
        if (typeof targetObj === 'function') {
            return function(...args) {
                if (args.length > 0 && args[0].name != null) {
                    name = args[0].name;
                }
                const actor = new Actor(name);
                actor.generator = targetObj.apply(actor, args);
                return actor;
            }
        }
        return targetObj;
    }
}