let engine;
let box;

function setup() {
    const canvas = createCanvas(800, 800);
    canvas.parent('viewport');

    box = new Box(200, 200, 30, 100);
    engine = Matter.Engine.create();

    Matter.Engine.run(engine);
    Matter.World.add(engine.world, box.body);
}

function draw() {
    background(0);

    box.draw();
    if (keyIsDown(UP_ARROW)) {
        box.up(1);
    } else if (keyIsDown(LEFT_ARROW)) {
        box.tiltLeft(1);
    } else if (keyIsDown(RIGHT_ARROW)) {
        box.tiltRight(1);
    }
}
