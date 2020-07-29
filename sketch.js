let engine;
let body;
let body2;
let ground;
function setup() {
    createCanvas(800, 800);
    engine = Matter.Engine.create();
    body = Matter.Bodies.rectangle(100, 50, 50, 50);
    body2 = Matter.Bodies.rectangle(130, 150, 50, 50);
    ground = Matter.Bodies.rectangle(400, 750, width, 100);
    console.log(ground);
    ground.isStatic = true;

    Matter.World.add(engine.world, [body, body2, ground]);
    Matter.Engine.run(engine);
}

function draw() {
    background(0);

    if (body.angle !== 0) {
        console.log(body.angle);
    }

    noStroke();
    fill(255, 0, 0);
    rect(body.position.x - 25, body.position.y - 25, 50, 50);
    stroke(255);
    strokeWeight(10);
    point(body.position.x, body.position.y);

    noStroke();
    fill(255, 0, 255);
    rect(body2.position.x - 25, body2.position.y - 25, 50, 50);
    stroke(255);
    strokeWeight(10);
    point(body2.position.x, body2.position.y);

    noStroke();
    fill(255, 255, 0);
    rect(ground.position.x - width / 2, ground.position.y - 50, width, 100);
    
    stroke(255, 0, 0);
    strokeWeight(10);
    point(400, 750);
}