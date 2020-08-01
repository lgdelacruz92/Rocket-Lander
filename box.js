class Box {
    constructor(x, y, w, h, brain, fitness) {
        this.body = Matter.Bodies.rectangle(x, y, w, h);
        this.w = w;
        this.h = h;
        Matter.Body.setAngle(this.body, map(random(), 0, 1, -PI/2, PI/2));
        if (brain) {
            this.brain = brain;
        } else {
            this.brain = new neataptic.architect.Perceptron(5,5,3);
        }

        this.body.collisionFilter.group = -1;
        if (fitness) {
            this.fitness= fitness;
            this.startingFitness = fitness;
        } else {
            this.fitness = 0;
            this.startingFitness = 0;
        }
        this.dead = false;
        this.color = createVector(0, 0);
    }

    setFitness(fitness) {
        this.fitness= fitness;
        this.startingFitness = fitness; 
    }

    _getRect() {
        return { x: this.body.position.x, y: this.body.position.y, w: this.w, h: this.h };
    }

    reset() {
        Matter.Body.setPosition(this.body, { x: random(0, width), y: random(0, 300) });
        Matter.Body.setVelocity(this.body, { x: 0, y: 0 });
    }

    up(scale) {
        const rectangle = this._getRect();
        const verticalVector = getVerticalVector(rectangle, this.body.angle);
        verticalVector.div(verticalVector.mag()).mult(scale/verticalVector.mag()).mult(0.005);
        const bottomPoint = getBottomPoint(rectangle, this.body.angle);
        Matter.Body.applyForce(this.body, bottomPoint, verticalVector)
    }

    tiltLeft(scale) {
        const rectangle = this._getRect();
        const topPoint = getTopPoint(rectangle, this.body.angle);
        const orthogonalTopVector = getOrthogonalTopUnitVector(rectangle, this.body.angle);
        Matter.Body.applyForce(this.body, topPoint, orthogonalTopVector.mult(scale/orthogonalTopVector.mag()).mult(0.001));
    }

    tiltRight(scale) {
        const rectangle = this._getRect();
        const topPoint = getTopPoint(rectangle, this.body.angle);
        const orthogonalTopVector = getOrthogonalTopUnitVector(rectangle, this.body.angle);
        Matter.Body.applyForce(this.body, topPoint, orthogonalTopVector.mult(scale/orthogonalTopVector.mag()).mult(-0.001));
    }

    update() {
        const rectangle = this._getRect();
        const verticalVector = getVerticalVector(rectangle, this.body.angle);
        const dotProduct = dot(verticalVector, { x: 0, y: -1 }) / verticalVector.mag();
        if (!this.dead) {
            this.fitness += this.getReward(dotProduct) - this.getPunishment(mag(this.body.velocity));
            if (this.fitness < 0) {
                this.fitness = this.startingFitness;
            }
        } else {
            this.fitness = this.startingFitness;
        }
        this.dontGoOutOfBounds();
        this.punishHighVelocity();

        const xVel = this.body.velocity.x / mag(this.body.velocity);
        const yVel = this.body.velocity.y / mag(this.body.velocity);
        const vel = createVector(xVel, yVel).mag();
        const hNorm = this.body.position.y / height;
        const output = this.brain.activate([vel, hNorm, this.body.position.x, this.body.position.y, this.body.angle / PI]);

        this.up(output[0]);
        this.tiltLeft(output[1]);
        this.tiltRight(output[2]);
    }

    punishHighVelocity() {
        if (mag(this.body.velocity) > 1) {
            this.fitness = this.startingFitness * 0.8;
        }
    }

    getReward(val) {
        const reward = 100 * val * val;
        return reward;
    }

    getPunishment(val) {
        if (dot(this.body.velocity, { x: 0, y: 1}) > 0) {
            return Math.abs(70);
        } else {
            return 0;
        }
    }

    dontGoOutOfBounds() {
        if (this.body.position.x < 0 || this.body.position.x > width) {
            this.fitness = this.startingFitness;
            this.dead = true;
        }
        if (this.body.position.y < 0 || this.body.position.y > height) {
            this.fitness = this.startingFitness;
            this.dead = true;
        }
    }

    draw() {
        push();
        translate(this.body.position.x, this.body.position.y);
        rotate(this.body.angle);
        noStroke();
        fill(255, this.color.x, this.color.y);
        rect(-this.w / 2, -this.h / 2, this.w, this.h - 20);
        fill(255, 200, 150);
        rect(-this.w / 2, -this.h / 2 + this.h - 20, this.w, 20);
        pop();

        stroke(255);
        strokeWeight(10);
        point(this.body.position.x, this.body.position.y);
    }
}