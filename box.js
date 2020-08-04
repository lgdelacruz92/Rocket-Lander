class Box {
    constructor(x, y, w, h, brain) {
        this.body = Matter.Bodies.rectangle(x, y, w, h);
        this.w = w;
        this.h = h;
        if (brain) {
            ;
            this.brain = brain;
        } else {
            this.brain = new neataptic.architect.Perceptron(6, 7, 3);
        }

        this.body.collisionFilter.group = -1;
        this.fitness = 0;
        this.dead = false;
        this.color = createVector(random(0, 255), random(0, 255), random(0, 255));
    }

    setColor(color) {
        this.color = color;
    }

    getFitness() {
        this.fitness;
    }

    setFitness(fitness) {
        this.fitness = fitness;
    }

    reset() {
        Matter.Body.setPosition(this.body, { x: random(0, width), y: random(0, 300) });
        Matter.Body.setVelocity(this.body, { x: 0, y: 0 });
    }

    up(scale) {
        if (scale > 0.5) {
            const verticalVector = createVector(0, -1);
            verticalVector.setMag(0.005);
            Matter.Body.applyForce(this.body, this.body.position, verticalVector);

            if (mag(this.body.velocity) > 1) {
                const unitVel = unitize(this.body.velocity);
                Matter.Body.setVelocity(this.body, unitVel);
            }
        }
    }

    left(scale) {
        if (scale > 0.5) {
            const forceVec = createVector(-1, 0);
            forceVec.setMag(0.005);
            Matter.Body.applyForce(this.body, this.body.position, forceVec);

            if (mag(this.body.velocity) > 1) {
                const unitVel = unitize(this.body.velocity);
                Matter.Body.setVelocity(this.body, unitVel);
            }
        } 
    }

    right(scale) {
        if (scale > 0.5) {
            const forceVec = createVector(1, 0);
            forceVec.setMag(0.005);
            Matter.Body.applyForce(this.body, this.body.position, forceVec);

            if (mag(this.body.velocity) > 1) {
                const unitVel = unitize(this.body.velocity);
                Matter.Body.setVelocity(this.body, unitVel);
            }
        } 
    }

    update() {
        if (mag(this.body.velocity) > 3) {
            this.up(1);
        }
        if (!this.dead && this.body.position.y < 645) {
            Matter.Body.setAngle(this.body, 0);
            if (this._outOfBounds()) {
                this.dead = true;
            }
            this.calculateFitness();
            const brainInput = this.getBrainInputs();
            const output = this.brain.activate(brainInput);
    
            this.lastOutput = output;
            this.up(output[0]);
            this.left(output[1]);
            this.right(output[2]);
        }
        if (this.dead) {
            this.fitness = 0;
        }

        if (this._crashed()) {
            this.dead = true;
        }
    }

    _crashed() {
        return (this.body.position.y > 640 && mag(this.body.velocity) > 5);
    }

    calculateFitness() {
        const distToTarget = dist(this.body.position, { x: 400, y: 650 });
        this.fitness = createVector(width,height).mag()/distToTarget;
    }

    _outOfBounds() {
        return this.body.position.x < 0 
        || this.body.position.x > width
        || this.body.position.y < 0
        || this.body.position.y > height;
    }
    

    getBrainInputs() {
        const x = clamp(this.body.position.x / width, 0, 1);
        const y = clamp(this.body.position.y / height, 0, 1);
        const targetx = 0.5;
        const targety = 0.8125;

        const clip = parseInt(Math.floor(this.body.angle * 100)) % 628;
        const angle = map(clip, -628, 628, 0, 1);
        const vel = map(mag(this.body.velocity), 0, 10000, 0, 1);
        return [x, y, angle, vel, targetx, targety];
    }

    draw() {
        push();
        translate(this.body.position.x, this.body.position.y);
        rotate(this.body.angle);
        noStroke();
        fill(this.color.x, this.color.y, this.color.z);
        rect(-this.w / 2, -this.h / 2, this.w, this.h - 20);
        fill(255, 200, 150);
        rect(-this.w / 2, -this.h / 2 + this.h - 20, this.w, 20);
        pop();

        stroke(255);
        strokeWeight(10);
        point(this.body.position.x, this.body.position.y);
    }
}
