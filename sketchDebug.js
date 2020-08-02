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
    box.checkOutOfBounds();
    console.log(box.fitness, mag(box.body.velocity));
    ground.draw();

    noStroke();
    fill(255, 0, 0, 70)
    rect(200, 600, 400, 100);

    fill(255, 100, 100, 70)
    rect(200, 300, 400, 300);
    if (keyIsDown(UP_ARROW)) {
        box.up(1);
    }
    if (keyIsDown(LEFT_ARROW)) {
        box.tiltLeft(1);
    } 
    if (keyIsDown(RIGHT_ARROW)) {
        box.tiltRight(1);
    }
}
