protospawn
======================

Game prototyping library powerd by the es2015 [proxy](https://developer.mozilla.org/en/docs/Web/JavaScript/Reference/Global_Objects/Proxy) and [generator](https://developer.mozilla.org/en/docs/Web/JavaScript/Reference/Global_Objects/Generator)

WIP

### Sample code

[code.ts](https://github.com/abagames/protospawn/blob/master/src/code.ts)

```
        ps.ply();
        ps.enm();
```

An actor is automatically generated when a function is called (hooked by the proxy)

```
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
```

Use a yield to pause an execution for a frame

```
    ps.bullet = function*(prop) {
        this.set(prop);
        this.speed = this.size = 3;
        this.mechs = [
            new m.Collision.TestAndRemove().set({name: 'explosion'})
        ];
    }
```

Add the predefined mech to enable the specific game mechanism

### TODO

Add many mechs to [mech.ts](https://github.com/abagames/protospawn/blob/master/src/mech.ts)

Create a more practical sample

### Libraries

[p5.js](http://p5js.org/) /
[lodash](https://lodash.com/)

License
----------
MIT
