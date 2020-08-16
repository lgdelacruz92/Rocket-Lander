class Rocket {
    constructor(x, y, w, h, brain, fitness) {
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
        if (fitness) {
            this.fitness = fitness;
        } else {
            this.fitness = 0;
        }
        this.dead = false;
        this.color = createVector(random(0, 255), random(0, 255), random(0, 255));
    }

    /**
     * Mutates the brain
     */
    mutate() {
        if (Math.random() > 0.5) {
            this.brain.mutate(true);
        } else {
            this.brain.mutate(false, true);
        }
    }
    
    /**
     * Resets the rocket
     */
    reset() {
        Matter.Body.setPosition(this.body, { x: randomX(), y: random(0, 300) });
        Matter.Body.setVelocity(this.body, { x: 0, y: 0});
        Matter.Body.setAngle(this.body, 0);
        this.dead = false;
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

    up(scale) {
        const verticalVector = createVector(0, -1);
        verticalVector.setMag(0.005 * scale);
        Matter.Body.applyForce(this.body, this.body.position, verticalVector);

        if (mag(this.body.velocity) > 1) {
            const unitVel = unitize(this.body.velocity);
            Matter.Body.setVelocity(this.body, unitVel);
        }
    }

    left(scale) {
        const forceVec = createVector(-1, 0);
        forceVec.setMag(0.005 * scale);
        Matter.Body.applyForce(this.body, this.body.position, forceVec);

        if (mag(this.body.velocity) > 1) {
            const unitVel = unitize(this.body.velocity);
            Matter.Body.setVelocity(this.body, unitVel);
        }
    }

    right(scale) {
        const forceVec = createVector(1, 0);
        forceVec.setMag(0.005 * scale);
        Matter.Body.applyForce(this.body, this.body.position, forceVec);

        if (mag(this.body.velocity) > 1) {
            const unitVel = unitize(this.body.velocity);
            Matter.Body.setVelocity(this.body, unitVel);
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
            for (let i = 0; i < this.brain.nodes.length; i++) {
                if (isNaN(this.brain.nodes[i].value)) {
                    console.log('The brain hit nan.', this.brain);
                }
            }
            this.lastOutput = output;
            this.up(map(output[0], -2, 2, 0, 1));
            this.left(map(output[1], -2, 2, 0, 1));
            this.right(map(output[2], -2, 2, 0, 1));
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
        this.fitness += createVector(width,height).mag()/distToTarget;
    }

    _outOfBounds() {
        return this.body.position.x < 0 
        || this.body.position.x > width
        || this.body.position.y < 0
        || this.body.position.y > height;
    }
    

    getBrainInputs() {
        const x = this.body.position.x / width
        const y = this.body.position.y / height
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
        ellipse(0, 0, this.w - 16, this.h - 18);
        imageMode(CENTER);
        image(rocketImg, 0, 5   );
        pop();
    }
}
