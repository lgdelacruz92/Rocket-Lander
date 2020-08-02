class Box {
    constructor(x, y, w, h, brain) {
        this.body = Matter.Bodies.rectangle(x, y, w, h);
        this.w = w;
        this.h = h;
        Matter.Body.setAngle(this.body, 0)
        if (brain) {
            ;
            this.brain = brain;
        } else {
            this.brain = new neataptic.architect.Perceptron(7, 7, 3);
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
            verticalVector.setMag(0.005);
            const bottomPoint = getBottomPoint(rectangle, this.body.angle);

            Matter.Body.applyForce(this.body, bottomPoint, verticalVector)

            if (mag(this.body.velocity) > 1) {
                const unitVel = unitize(this.body.velocity);
                Matter.Body.setVelocity(this.body, unitVel);
            }
        }
    }

    tiltLeft(scale) {
        if (scale > 0.5) {
            const rectangle = this._getRect();
            const topPoint = getTopPoint(rectangle, this.body.angle);
            const orthogonalTopVector = getOrthogonalTopUnitVector(rectangle, this.body.angle);
            orthogonalTopVector.setMag(0.001);
            Matter.Body.applyForce(this.body, topPoint, orthogonalTopVector);
        }
    }

    tiltRight(scale) {
        if (scale > 0.5) {
            const rectangle = this._getRect();
            const topPoint = getTopPoint(rectangle, this.body.angle);
            const orthogonalTopVector = getOrthogonalTopUnitVector(rectangle, this.body.angle);
            orthogonalTopVector.setMag(-0.001);
            Matter.Body.applyForce(this.body, topPoint, orthogonalTopVector);
        }
    }

    update() {
        this.calculateFitness();
        const brainInput = this.getBrainInputs();
        const output = this.brain.activate(brainInput);

        this.lastOutput = output;
        this.up(output[0]);
        this.tiltLeft(output[1]);
        this.tiltRight(output[2]);
    }

    calculateFitness() {
        if (!this.dead) {
            this.fitness += this.discourageTilting();
            if (!this._inXBounds()) {
                this.fitness -= 2;
            }
        }
        else {
            this.fitness = 0;
        }
    }

    checkOutOfBounds() {
        if (this.body.position.x > width
            || this.body.position.x < 0
            || this.body.position.y < 0
            || this.body.position.y > height) {
            this.dead = true;
        }
    }

    discourageTilting() {
        if (this.body.angle >= PI / 2 || this.body.angle <= -PI / 2) {
            if (this._inHighCriticalZone(this.body.position)) {
                this.dead = true;
                return 0;
            }
            return 0;
        } else {
            if (this._inHighCriticalZone(this.body.position)
                && mag(this.body.velocity) > 8) {
                this.dead = true;
                return 0;
            }
            const distanceToMark = dist(this.body.position, {x: 200, y: 600});
            if (distanceToMark !== 0) {
                return -Math.pow(this.body.angle, 2) + 1 + distanceToMark;
            }

            return -Math.pow(this.body.angle, 2) + 1;
        }
    }

    _inXBounds() {
        return 200 < this.body.position.x && this.body.position.x < 600;
    }

    _inHighCriticalZone(pos) {
        const critZone = { x: 200, y: 600, w: 400, h: 100 };
        if (critZone.x < pos.x && pos.x < critZone.x + critZone.w
            && critZone.y < pos.y && pos.y < critZone.y + critZone.h) {
            return true;
        }
        return false;
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
