class Rocket {
    constructor(x, y, w, h, brain, fitness) {
        this.body = Matter.Bodies.rectangle(x, y, w, h);
        this.w = w;
        this.h = h;
        if (brain) {
            this.brain = brain;
        }

        this.body.collisionFilter.group = -1;
        if (fitness) {
            this.fitness = fitness;
        } else {
            this.fitness = 0;
        }
        this.color = createVector(random(0, 255), random(0, 255), random(0, 255));
        this.id = uuidv4();
    }

    /**
     * Function to mate with other rockets.
     * @param {Rocket} otherRocket Partner rocket
     */
    mate(otherRocket) {
        const childBrain = this.brain.crossOver(otherRocket.brain);
        const childRocket = new Rocket(randomX(), random(0, 300), this.w, this.h, childBrain, 0);
        childRocket.mutate();
        if (this.fitness > otherRocket.fitness) {
            childRocket.color = this.color;
        } else {
            childRocket.color = otherRocket.color;
        }
        Matter.World.add(engine.world, childRocket.body);
        return childRocket;
    }

    /**
     * Checks the species distance between itself and other rocket
     * @param {Rocket} otherRocket Other rocket
     */
    dist(otherRocket) {
        return this.brain.dist(otherRocket.brain);
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
     * Deletes rocket from the game engine
     */
    delete() {
        Matter.World.remove(engine.world, this.body);
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
        Matter.Body.setAngle(this.body, 0);

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

    calculateFitness() {
        const distToTarget = dist(this.body.position, { x: 400, y: 650 });
        const val = distToTarget / createVector(width, height).mag();
        this.fitness = 1/val;
    }

    outOfBounds() {
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

    _getFitness() {
        const fitness = parseInt(Math.floor(this.fitness * 100));
        return fitness / 100;
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
        fill(0);
        text(`${this._getFitness()}`, 0, 0);
        pop();
    }
}
