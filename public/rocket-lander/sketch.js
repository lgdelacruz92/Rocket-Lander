let backgroundImg;
let count;
let decisionsToSkip;
let engine;
let neat;
let rocketImg;
let rockets;
let generation;

// * NUM_ROCKETS has to be a minimum of 100
const NUM_ROCKETS = 100;

// * NEAT config
const neat_config = {
    model: [
        { nodeCount: 6, type: "input" },
        { nodeCount: 3, type: "output", activationfunc: activation.RELU }
    ],
    mutationRate: 0.05,
    crossoverMethod: crossover.RANDOM,
    mutationMethod: mutate.RANDOM,
    populationSize: NUM_ROCKETS
};

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
    neat = new NEAT(neat_config);

    count = 0;
    generation = 1;
    decisionsToSkip = {};
}

function draw() {
    image(backgroundImg, 0, 0);

    for (let i = 0; i < rockets.length; i++) {
        const inputs = rockets[i].getBrainInputs();
        neat.setInputs(inputs, i);
    }

    neat.feedForward();
    const decisions = neat.getDesicions();

    if (decisions.length !== rockets.length) {
        throw Error('This should not happen');
    }

    for (let i = 0; i < decisions.length; i++) {
        if (rockets[i].outOfBounds()) {
            rockets[i].dead = true;
        }
        rockets[i].update(decisions[i]);
        rockets[i].draw();
    }

    if (count >= 500) {
        // Speciation
        for (let i = 0; i < rockets.length; i++) {
            neat.setFitness(rockets[i].fitness, i);
        }
        neat.doGen();

        writeRocketAvg();
        writeGenerationNumber();
        resetAllRockets();
        count = 0;
        decisionsToSkip = {};
    }
    count += 1;

    drawGround();
    drawWater();
}

/**
 * Writes the rocket avg chart
 */
function writeRocketAvg() {
    myChart.data.datasets[0].data.push({ x: generation, y: getAvgFitness() });
    myChart.update();
}

/**
 * Gets the avg fitness
 */
function getAvgFitness() {
    let fitness = 0;
    for (let i = 0; i < rockets.length; i++) {
        fitness += rockets[i].fitness;
    }
    return fitness / rockets.length;
}

/**
 * Writes the generation number
 */
function writeGenerationNumber() {
    const generationText = document.querySelector('.reports .generation .number');
    if (generationText) {
        generationText.innerHTML = `${generation}`;
        generation += 1;
    } else {
        throw Error('Generation text is missing.');
    }
}

/**
 * Resets all rockets
 */
function resetAllRockets() {
    for (let i = 0; i < rockets.length; i++) {
        rockets[i].reset();
    }
}

/**
 * Finds the rocket based on id, if not found return null
 * @param {string} uuidv4 The id of the rocket
 */
function getRocket(uuidv4) {
    for (let i = 0; i < rockets.length; i++) {
        if (rockets[i].id === uuidv4) {
            return rockets[i];
        }
    }
    return null;
}

/**
 * Finds the rocket index based on id, if not found return null
 * @param {string} uuidv4 The id of the rocket
 */
function getRocketIndex(uuidv4) {
    for (let i = 0; i < rockets.length; i++) {
        if (rockets[i].id === uuidv4) {
            return i;
        }
    }
    return null;
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
        const yLoc = 20 * sin(i / 200 + map(count, 0, 500, 0, 10)) + 750;
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
        const newRocket = new Rocket(randomX(), random(0, 300), 30, 100);
        rockets.push(newRocket);
    }
    Matter.World.add(engine.world, [...rockets.map(b => b.body)]);
}

function randomX() {
    const leftRandomPos = random(0, 300);
    const rightRandomPos = random(500, 800);
    if (Math.random() > 0.5) return rightRandomPos;
    else return leftRandomPos;
    // return random(0, width);
}

/**
 * Removes a rocket from the game
 * @param {number} i The index of the rocket
 */
function removeRocket(i) {
    rockets[i].delete();
    rockets.splice(i, 1);
}