class Box {
    constructor(x, y, w, h) {
        this.body = Matter.Bodies.rectangle(x, y, w, h);
        this.w = w;
        this.h = h;
    }

    _getRect() {
        return { x: this.body.position.x, y: this.body.position.y, w: this.w, h: this.h };
    }

    up() {
        const rectangle = this._getRect();
        const verticalVector = getVerticalVector(rectangle, this.body.angle);
        verticalVector.div(verticalVector.mag()).mult(0.05);
        const bottomPoint = getBottomPoint(rectangle, this.body.angle);
        Matter.Body.applyForce(this.body, bottomPoint, verticalVector)
    }

    tiltLeft() {
        const rectangle = this._getRect();
        const topPoint = getTopPoint(rectangle, this.body.angle);
        const orthogonalTopVector = getOrthogonalTopUnitVector(rectangle, this.body.angle);
        Matter.Body.applyForce(this.body, topPoint, orthogonalTopVector.mult(0.01));
    }

    tiltRight() {
        const rectangle = this._getRect();
        const topPoint = getTopPoint(rectangle, this.body.angle);
        const orthogonalTopVector = getOrthogonalTopUnitVector(rectangle, this.body.angle);
        Matter.Body.applyForce(this.body, topPoint, orthogonalTopVector.mult(-0.01));
    }

    update() {
        const rectangle = this._getRect();
        if (rectangle.x < -100 || rectangle.x > width + 100 || rectangle.y < 0) {
            Matter.Body.setPosition(this.body, {x: random(0, width), y: random(0, 600)});
            Matter.Body.setVelocity(this.body, {x: 0, y: 0});
            Matter.Body.setAngle(this.body, 0);
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