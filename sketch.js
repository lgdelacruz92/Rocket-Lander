let engine;
let rocket;
let bestRocket;

let rocketElites = [];

function setup() {
    createCanvas(800, 800);
    engine = Matter.Engine.create();
    rocket = new Box(random(0, width), random(0, 300), 30, 100);

    ground = Matter.Bodies.rectangle(400, 750, width, 100);
    ground.isStatic = true;

    Matter.World.add(engine.world, [rocket.body, ground]);
    Matter.Engine.run(engine);
}

function draw() {
    background(0);

    rocket.draw();
    rocket.update();

    noStroke();
    fill(255, 255, 0);
    rect(ground.position.x - width / 2, ground.position.y - 50, width, 100);
}

function keyTyped() {
    if (key === 's') {
        rocketElites.push(rocket);
    }
    else if (key === 'r') {
        Matter.World.remove(engine.world, rocket.body);
        if (bestRocket) {
            rocket = bestRocket;
            rocket.reset();
            console.log('Running best rocket');
        } else {
            rocket = new Box(random(0, width), random(0, 300), 30, 100);
        }
        Matter.World.add(engine.world, rocket.body);
    }
    else if (key === 'm') {
        const n1 = rocketElites[0].brain;
        const n2 = rocketElites[1].brain;
        const newN = neataptic.Network.crossOver(n1, n2);

        for (let i = 0; i < rocketElites.length; i++) {
            Matter.World.remove(engine.world, rocketElites[i].body);
        }

        rocketElites = [];
        rocket = new Box(random(0, width), random(0, 300), 30, 100);
        rocket.brain = newN;
        bestRocket = rocket;
        Matter.World.add(engine.world, rocket.body);
    }
}

function keyPressed() {
    if (keyCode === UP_ARROW) {
        body.up(1);
    }
    else if (keyCode === LEFT_ARROW) {
        body.tiltLeft(1);
    }
    else if (keyCode === RIGHT_ARROW) {
        body.tiltRight(1);
    }
}