class Box {
    constructor(x, y, w, h, brain, fitness) {
        this.body = Matter.Bodies.rectangle(x, y, w, h);
        this.w = w;
        this.h = h;
        Matter.Body.setAngle(this.body, 0)
        if (brain) {;
            this.brain = brain;
        } else {
            this.brain = new neataptic.architect.Perceptron(7,5,3);
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
        if (scale > 0.5) {
            const rectangle = this._getRect();
            const verticalVector = getVerticalVector(rectangle, this.body.angle);
            verticalVector.setMag(0.05);
            const bottomPoint = getBottomPoint(rectangle, this.body.angle);
    
            Matter.Body.applyForce(this.body, bottomPoint, verticalVector)
        }
    }

    tiltLeft(scale) {
        if (scale > 0.5) {
            const rectangle = this._getRect();
            const topPoint = getTopPoint(rectangle, this.body.angle);
            const orthogonalTopVector = getOrthogonalTopUnitVector(rectangle, this.body.angle);
            orthogonalTopVector.setMag(0.005);
            Matter.Body.applyForce(this.body, topPoint, orthogonalTopVector);
        }
    }

    tiltRight(scale) {
        if (scale > 0.5) {
            const rectangle = this._getRect();
            const topPoint = getTopPoint(rectangle, this.body.angle);
            const orthogonalTopVector = getOrthogonalTopUnitVector(rectangle, this.body.angle);
            orthogonalTopVector.setMag(-0.005);
            Matter.Body.applyForce(this.body, topPoint, orthogonalTopVector);
        }
    }

    update() {
        this.fitness += this.calculateFitness();
        const brainInput = this.getBrainInputs();
        const output = this.brain.activate(brainInput);
        
        this.lastOutput = output;
        if (output[0] < output[1] && output[1] > output[2]) {
            this.up(1);
        } else if (output[1] < output[0] && output[0] > output[2]) {
            this.tiltLeft(1);
        } else if (output[0] < output[2] && output[2] > output[1]) {
            this.tiltRight(1);
        }
    }

    calculateFitness() {
        const tiltScore = this.discourageTilting();
        const outOfBounds = this.discourageOutOfBounds();
        const highVel = this.discourageHighVelocity();
        return  tiltScore + outOfBounds + highVel;
    }

    /*
        Need a function that evaluates from 0 to 100
        @x {number} normally the angle of the body
        @return number between 0 to 100;
    */
    discourageTilting() {
        return gaussian(this.body.angle);
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
                return -5;
            }
        return 0;
    }
    
    discourageHighVelocity() {
        if (mag(this.body.velocity) > 2) {
            return -mag(this.body.velocity);
        }
        return 0;
    }

    getBrainInputs() {
        const x = clamp(this.body.position.x / width, 0, 1);
        const y = clamp(this.body.position.y / height, 0, 1);
        const groundLowerX = 0.25;
        const groundUpperX = 0.75;
        const floor = 0.75;

        const clip = parseInt(Math.floor(this.body.angle * 100)) % 628;
        const angle = map(clip, -628, 628, 0, 1);
        const vel = map(mag(this.body.velocity), 0, 10000, 0, 1);
        return [x, y, angle, vel, groundLowerX, groundUpperX, floor];
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

function gaussian(x) {
    const val = -Math.pow(x, 2) + 20;
    return val;
}

