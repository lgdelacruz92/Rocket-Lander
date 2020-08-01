class Box {
    constructor(x, y, w, h, brain, fitness) {
        this.body = Matter.Bodies.rectangle(x, y, w, h);
        this.w = w;
        this.h = h;
        Matter.Body.setAngle(this.body, 0)
        if (brain) {;
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

        this.color = createVector(random(0, 255), random(0, 255), random(0, 255));
    }

    setColor(color) {
        this.color = color;
    }

    getFitness() {
        this.fitness;
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
        Matter.Body.applyForce(this.body, topPoint, orthogonalTopVector.mult(scale/orthogonalTopVector.mag()).mult(0.01));
    }

    tiltRight(scale) {
        const rectangle = this._getRect();
        const topPoint = getTopPoint(rectangle, this.body.angle);
        const orthogonalTopVector = getOrthogonalTopUnitVector(rectangle, this.body.angle);
        Matter.Body.applyForce(this.body, topPoint, orthogonalTopVector.mult(scale/orthogonalTopVector.mag()).mult(-0.01));
    }

    update() {
        this.fitness += this.calculateFitness();
        const brainInput = this.getBrainInputs();
        const output = this.brain.activate([brainInput.hNorm, brainInput.x, brainInput.y, brainInput.vel, brainInput.angle]);
        
        this.up(output[0]);
        this.tiltLeft(output[1]);
        this.tiltRight(output[2]);
    }

    calculateFitness() {
        const tiltScore = this.discourageTilting();
        const outOfBounds = this.discourageOutOfBounds();
        return  tiltScore + outOfBounds;
    }

    /*
        Need a function that evaluates from 0 to 100
        @x {number} normally the angle of the body
        @return number between 0 to 100;
    */
    discourageTilting() {
        if (this.body.angle > PI/2 || this.body.angle < PI/2) {
            return -1;
        }
        const topVector = getVerticalVector(this._getRect(), this.body.angle);
        topVector.setMag(1);
        return topVector.dot(createVector(0, -1));
    }

    /*
        Discourage going out of bounds
        return 50 or 0
    */
    discourageOutOfBounds() {
        if (this.body.position.x < 0 
            || this.body.position.x > width
            || this.body.position.y < 0
            || this.body.position.y > height) {
                return -1;
            }
        return 0;
    }

    getBrainInputs() {
        const hNorm = clamp(this.body.position.y / height, 0, 1);
        const x = clamp(this.body.position.x/width, 0, 1);
        const y = clamp(this.body.position.y / height, 0, 1);

        const clip = parseInt(Math.floor(this.body.angle * 100)) % 628;
        const angle = map(clip, -628, 628, 0, 1);
        const vel = map(mag(this.body.velocity), 0, 10000, 0, 1);
        return { hNorm, x, y, angle, vel}
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