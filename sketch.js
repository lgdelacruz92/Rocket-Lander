let engine;
let body

function setup() {
    createCanvas(800, 800);
    engine = Matter.Engine.create();
    body = new Box(100, 100, 30, 100);

    ground = Matter.Bodies.rectangle(400, 750, width, 100);
    ground.isStatic = true;

    Matter.World.add(engine.world, [body.body, ground]);
    Matter.Engine.run(engine);

}

function draw() {
    background(0);
    body.draw();
    body.update();
    noStroke();
    fill(255, 255, 0);
    rect(ground.position.x - width / 2, ground.position.y - 50, width, 100);
}

function keyPressed() {
    if (keyCode === UP_ARROW) {
        body.up();
    }
    else if (keyCode === LEFT_ARROW) {
        body.tiltLeft();
    }
    else if (keyCode === RIGHT_ARROW) {
        body.tiltRight();
    }
}