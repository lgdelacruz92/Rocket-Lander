let count;
let engine;
let rocketImg;
let backgroundImg;
let rockets;

// * NUM_ROCKETS has to be a minimum of 100
const NUM_ROCKETS = 3;

// * Elitism number
const ELITISM = 5;

function preload() {
    rocketImg = loadImage('../../assets/rocket.png');
    backgroundImg = loadImage('../../assets/Background.png');
}

function setup() {
    const canvas = createCanvas(800, 800);
    canvas.parent('viewport');
    engine = Matter.Engine.create();

    initRockets();

    ground = Matter.Bodies.rectangle(400, 750, width / 2, 100);
    ground.isStatic = true;

    Matter.World.add(engine.world, ground);
    Matter.Engine.run(engine);

    count = 0;
    generation = 1;
    maxScore = -Infinity;
    prevGenScore = -Infinity;
    playGoat = false;
    fromGoatPlay = false;
    graphX = 0;
    evaluationCount = 0;
}

function draw() {
    image(backgroundImg, 0, 0);

    for (let i = 0; i < rockets.length; i++) {
        rockets[i].draw();
        rockets[i].update();
    }
    if (count >= 500) {
        let i1 = parseInt(Math.random() * rockets.length);
        let i2 = parseInt(Math.random() * rockets.length);
        while (i1 === i2) { 
            i2 = parseInt(Math.random() * rockets.length);
        }
        const childBrain = rockets[i2].brain.crossOver(rockets[i2].brain);
        const newRocket = new Rocket(randomX(), random(0, 300), 30, 100, childBrain);
        newRocket.mutate();
        Matter.World.add(engine.world, newRocket.body);
        rockets.push(newRocket);
        for (let i = 0; i < rockets.length; i++) {
            rockets[i].reset();
        }
        count = 0;
    }
    count += 1;

    drawGround();
    drawWater();
}

/**
 * Draws the Ground
 */
function drawGround() {
    stroke(0);
    strokeWeight(2);
    fill(200, 200, 200);
    rect(ground.position.x - width / 4, ground.position.y - 50, width / 2, 100);
}

/*
    Draw water
    @return void
*/
function drawWater() {
    stroke(52, 158, 200, 50);
    strokeWeight(5);
    for (let i = 0; i < width; i++) {
        const yLoc = 20 * sin(i/200 + map(count, 0, 500, 0, 10)) + 750;
        point(i, yLoc);
        line(i, height, i, yLoc);
    }
}

/**
 * Initializes the rockets
 */
function initRockets() {
    rockets = [];

    for (let i = 0; i < NUM_ROCKETS; i++) {
        const neat = new Neat(6, 3);
        const newRocket = new Rocket(randomX(), random(0, 300), 30, 100, neat);
        rockets.push(newRocket);
    }
    Matter.World.add(engine.world, [...rockets.map(b => b.body)]);
}

function randomX() {
    const leftRandomPos = random(0, 350);
    const rightRandomPos = random(450, 800);
    if (random() > 0.5) return rightRandomPos;
    else return leftRandomPos;
}