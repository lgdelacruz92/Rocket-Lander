let engine;
let rockets;
let bestRocket;

let rocketElites = [];

let count;

// * NUM_ROCKETS has to be a minimum of 100
const NUM_ROCKETS = 100;

function setup() {
    createCanvas(800, 800);
    engine = Matter.Engine.create();
    initRockets();

    ground = Matter.Bodies.rectangle(400, 750, width, 100);
    ground.isStatic = true;

    Matter.World.add(engine.world, ground);
    Matter.Engine.run(engine);

    count = 0;
}

function draw() {
    background(0);

    for (let i = 0; i < rockets.length; i++) {
        rockets[i].draw();
        rockets[i].update();
    }

    noStroke();
    fill(255, 255, 0);
    rect(ground.position.x - width / 2, ground.position.y - 50, width, 100);
    if (count >= 500) {
        filterFittest();
        initNextGenRockets();
        count = 0;
    }
    count += 1;
}

function initRockets() {
    rockets = [];

    for (let i = 0; i < NUM_ROCKETS; i++) {
        rockets.push(new Box(random(0, width), random(0, 300), 30, 100));
    }
    Matter.World.add(engine.world, [...rockets.map(b => b.body)]);
}

function initNextGenRockets() {
    rockets = [];
    const nextGenBrains = makeNextGenBrains();
    let numNewRockets = 0;
    while (numNewRockets < NUM_ROCKETS) {
        const randomNextGenBrain = nextGenBrains[parseInt(random(0, nextGenBrains.length))];
        randomNextGenBrain.mutate(neataptic.methods.mutation.MOD_BIAS);
        rockets.push(new Box(random(0, width), random(0, 300), 30, 100, randomNextGenBrain));
        
        numNewRockets += 1;
    }
    Matter.World.add(engine.world, [...rockets.map(b => b.body)]);
}

function makeNextGenBrains() {

    const nextGenBrains = [];
    const maxNextGenBrains = 10;
    if (nextGenBrains.length < maxNextGenBrains) {
        for (let i = 0; i < rocketElites.length; i++) {
            for (let j = 0; j < rocketElites.length; j++) {
                const parent1 = rocketElites[i];
                const parent2 = rocketElites[j];
                if (parent1 !== parent2) {
                    const childBrain = neataptic.Network.crossOver(parent1.brain, parent2.brain);
                    nextGenBrains.push(childBrain);
                }
            }
        }
    }

    // * Make sure to remove the rocket elites when they produce offspring
    // * Make sure to also remove from world
    for (let i = 0; i < rocketElites.length; i++) {
        Matter.World.remove(engine.world, rocketElites[i]);
    }
    rocketElites = [];
    
    return nextGenBrains;
}

function filterFittest() {
    let maxFitn = maxFitness();
    const interventionLimit = parseInt(0.9 * rockets.length);
    for (let i = 0; i < rockets.length; i++) {
        const normalizedFitness = map(rockets[i].fitness, -maxFitn, maxFitn, 0, 1);

        // * If there are no elites making it. Intervene
        if (i > interventionLimit && rocketElites.length <= 1) {
            for (let j = i ; j < rockets.length; j++) {
                rocketElites.push(rockets[i]);
            }
            break;
        }

        if (normalizedFitness > 0.97) {
            rocketElites.push(rockets[i]);
        } else {
            Matter.World.remove(engine.world, rockets[i].body);
        }
    }
    rockets = [];
}

function maxFitness() {
    let maxNum = -Infinity;
    for (let i = 0; i < rockets.length; i++) {
        if (maxNum < rockets[i].fitness) {
            maxNum = rockets[i].fitness;
        }
    }
    return maxNum;
}
