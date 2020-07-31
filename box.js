class Box {
    constructor(x, y, w, h, brain) {
        this.body = Matter.Bodies.rectangle(x, y, w, h);
        this.w = w;
        this.h = h;
        Matter.Body.setAngle(this.body, map(random(), 0, 1, -PI/2, PI/2));
        if (brain) {
            this.brain = brain;
        } else {
            this.brain = new neataptic.architect.Perceptron(3,5,3);
        }

        this.body.collisionFilter.group = -1;
        this.fitness = 0;
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
        this.fitness += dotProduct;

        this.dontGoOutOfBounds();

        const xVel = this.body.velocity.x / mag(this.body.velocity);
        const yVel = this.body.velocity.y / mag(this.body.velocity);
        const vel = createVector(xVel, yVel).mag();
        const hNorm = this.body.position.y / height;
        const output = this.brain.activate([vel, hNorm, this.body.angle / PI]);

        this.up(output[0]);
        this.tiltLeft(output[1]);
        this.tiltRight(output[2]);
    }

    dontGoOutOfBounds() {
        if (this.body.position.x < 0 || this.body.position.x > width) {
            this.fitness -= 5;
        }
        if (this.body.position.y < 0 || this.body.position.y > height) {
            this.fitness -= 5;
        }
    }

    draw() {
        push();
        translate(this.body.position.x, this.body.position.y);
        rotate(this.body.angle);
        noStroke();
        fill(255, 0, 0);
        rect(-this.w / 2, -this.h / 2, this.w, this.h - 20);
        fill(255, 200, 150);
        rect(-this.w / 2, -this.h / 2 + this.h - 20, this.w, 20);
        pop();

        stroke(255);
        strokeWeight(10);
        point(this.body.position.x, this.body.position.y);
    }
}