class Rocket {
    constructor(x, y) {
        this.body = Matter.Bodies.rectangle(x, y, 30, 100);
        this.w = 30;
        this.h = 100;

        this.body.collisionFilter.group = -1;
        this.color = createVector(random(0, 255), random(0, 255), random(0, 255));
        this.id = uuidv4();
        this.dead = false;
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

    up() {
        const verticalVector = createVector(0, -1);
        verticalVector.setMag(0.005);
        Matter.Body.applyForce(this.body, this.body.position, verticalVector);

        if (mag(this.body.velocity) > 1) {
            const unitVel = unitize(this.body.velocity);
            Matter.Body.setVelocity(this.body, unitVel);
        }
    }

    left() {
        const forceVec = createVector(-1, 0);
        forceVec.setMag(0.005);
        Matter.Body.applyForce(this.body, this.body.position, forceVec);

        if (mag(this.body.velocity) > 1) {
            const unitVel = unitize(this.body.velocity);
            Matter.Body.setVelocity(this.body, unitVel);
        }
    }

    right() {
        const forceVec = createVector(1, 0);
        forceVec.setMag(0.005);
        Matter.Body.applyForce(this.body, this.body.position, forceVec);

        if (mag(this.body.velocity) > 1) {
            const unitVel = unitize(this.body.velocity);
            Matter.Body.setVelocity(this.body, unitVel);
        }
    }

    update(decision) {
        if (mag(this.body.velocity) > 3) {
            this.up(1);
        }
        Matter.Body.setAngle(this.body, 0);

        this.calculateFitness();

        if (decision === 0) {
            this.up();
        } else if (decision === 1) {
            this.left();
        } else if (decision === 2) {
            this.right();
        } else {
            throw Error(`${decision} is not a proper decision from Neat.`)
        }
    }

    calculateFitness() {
        if (!this.dead) {
            const distToTarget = dist(this.body.position, { x: 400, y: 650 });
            const val = distToTarget / createVector(width, height).mag();
            this.fitness = 1/val;
        } else {
            this.fitness = 0;
        }
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
        pop();
    }
}
