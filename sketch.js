let engine;
let bodies;

function setup() {
    createCanvas(800, 800);
    engine = Matter.Engine.create();
    bodies = [];
    for (let i = 0; i < 20; i++) {
        bodies.push(new Box(random(0, width), random(0, 600), 25, 100));
    }
    body = new Box(100, 100, 50, 50);
    ground = Matter.Bodies.rectangle(400, 750, width, 100);
    ground.isStatic = true;

    Matter.World.add(engine.world, [...bodies.map(b => b.body), ground]);
    Matter.Engine.run(engine);
}

function draw() {
    background(0);

    for (let i = 0; i < bodies.length; i++) {
        bodies[i].draw();
    }

    noStroke();
    fill(255, 255, 0);
    rect(ground.position.x - width / 2, ground.position.y - 50, width, 100);
}