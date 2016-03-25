protospawn
======================

Experimental game prototyping library powerd by the es2015 [proxy](https://developer.mozilla.org/en/docs/Web/JavaScript/Reference/Global_Objects/Proxy) and [generator](https://developer.mozilla.org/en/docs/Web/JavaScript/Reference/Global_Objects/Generator)

### Sample code

[code.ts](https://github.com/abagames/protospawn/blob/master/src/code.ts)

[demo](http://abagames.sakura.ne.jp/16/protospawn/)

An actor is automatically generated when a function is called (hooked by the proxy)

```
        ps.ship({isPlayer: true, pos: {x: 50}});
        ps.ship({isPlayer: false});
```

Use a yield to pause an execution for a frame

```
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
```

Add the predefined mech to enable the specific game mechanism

```
    ps.bullet = function*(prop) {
        this.set(prop);
        this.speed = this.size = 3;
        this.mechs = [
            new m.Collision.TestAndRemove().set({name: ['explosion', 'barrier']})
        ];
    }
```

### Libraries

[p5.js](http://p5js.org/) /
[lodash](https://lodash.com/)

License
----------
MIT
