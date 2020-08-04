let engine;
let box;

function setup() {
    const canvas = createCanvas(800, 800);
    canvas.parent('viewport');

    box = new Box(400, 200, 30, 100);
    ground = new Box(400, 750, 400, 100);
    ground.body.collisionFilter.group = 0;
    ground.body.isStatic = true;
    engine = Matter.Engine.create();

    Matter.Engine.run(engine);
    Matter.World.add(engine.world, box.body);
    Matter.World.add(engine.world, ground.body);
}

function draw() {
    background(0);

    box.draw();
    box.calculateFitness();
    Matter.Body.setAngle(box.body, 0);
    // console.log(box.fitness, mag(box.body.velocity));
    ground.draw();

    noStroke();
    fill(255, 0, 0, 70)
    rect(200, 600, 400, 100);

    fill(255, 100, 100, 70)
    rect(200, 300, 400, 300);
    if (box.body.position.y < 645) {
        if (keyIsDown(UP_ARROW)) {
            box.up(1);
        }
        if (keyIsDown(LEFT_ARROW)) {
            box.left(1);
        }
        if (keyIsDown(RIGHT_ARROW)) {
            box.right(1);
        }
    }

    const mousePos = { x: mouseX, y: mouseY};
    const distToTarget = dist(mousePos, { x: 400, y: 650});
    if (distToTarget !== 0) {
        console.log(createVector(width,height).mag()/distToTarget, mousePos, distToTarget);
    }
}
