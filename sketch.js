let bestRocket;
let count;
let engine;
let generation;
let maxScore;
let rocketElites = [];
let rockets;
let prevGenScore;

// let staticRocket;
// let staticRocketAngle;

// * NUM_ROCKETS has to be a minimum of 100
const NUM_ROCKETS = 1;

function setup() {
    const canvas = createCanvas(800, 800);
    canvas.parent('viewport');
    engine = Matter.Engine.create();
    initRockets();

    ground = Matter.Bodies.rectangle(400, 750, width, 100);
    ground.isStatic = true;

    Matter.World.add(engine.world, ground);
    Matter.Engine.run(engine);

    count = 0;
    generation = 1;
    maxScore = -Infinity;
    prevGenScore = -Infinity;

    // staticRocket = new Box(width/2, height/2, 30, 100);
    // staticRocket.isStatic = true;
    // staticRocketAngle = 0;
    // Matter.Body.setAngle(staticRocket.body, staticRocketAngle);

}

function draw() {
    background(0);
    // staticRocket.draw();
    // staticRocket.update();
    // Matter.Body.setAngle(staticRocket.body, staticRocketAngle);
    // staticRocketAngle -= 0.1;
    // console.log(staticRocket.body.angle);

    recordGeneration();
    recordMaxScore();
    recordPrevGenScore();

    for (let i = 0; i < rockets.length; i++) {
        rockets[i].draw();
        rockets[i].update();
    }

    noStroke();
    fill(255, 255, 0);
    rect(ground.position.x - width / 2, ground.position.y - 50, width, 100);
    if (count >= 500) {
        const maxFit = filterFittest();
        prevGenScore = maxFit;
        if (maxFit > maxScore) {
            maxScore = maxFit;
        }
        initNextGenRockets(maxScore);
        const colorFitnessData = collectColorFitnessData(rockets);
        colorFitnessData.sort((a, b) => b.fitness - a.fitness);
        showRocketFitnesses(colorFitnessData);
        const numBodies = Matter.Composite.allBodies(engine.world);
        if (numBodies > 101) {
            console.log('Memory leak', numBodies);
        }
        count = 0;
        generation += 1;
    }
    count += 1;
}

function recordGeneration() {
    const elem = document.querySelector('.reports .generation .number');
    if (elem) elem.innerHTML = `${generation}`;
}

function recordMaxScore() {
    const elem = document.querySelector('.reports .max-score .number');
    if (elem) elem.innerHTML = `${maxScore}`;
}


function recordPrevGenScore() {
    const elem = document.querySelector('.reports .previous-gen-score .number');
    if (elem) elem.innerHTML = `${prevGenScore}`;
}

function initRockets() {
    rockets = [];

    for (let i = 0; i < NUM_ROCKETS; i++) {
        rockets.push(new Box(random(0, width), random(0, 300), 30, 100));
    }
    Matter.World.add(engine.world, [...rockets.map(b => b.body)]);
}

function initNextGenRockets(maxScore) {
    rockets.forEach(r => Matter.World.remove(engine.world, r.body));
    rockets = [];
    const nextGenBrains = makeNextGenBrains();
    let numNewRockets = 0;
    while (numNewRockets < NUM_ROCKETS - rocketElites.length) {
        const randomNextGenBrain = nextGenBrains[parseInt(random(0, nextGenBrains.length))];
        randomNextGenBrain.childBrain.mutate(neataptic.methods.mutation.MOD_BIAS);
        const babyRocket = new Box(random(0, width), random(0, 300), 30, 100, randomNextGenBrain.childBrain, maxScore * 0.5);
        babyRocket.setColor(randomNextGenBrain.parent.color);
        rockets.push(babyRocket);

        numNewRockets += 1;
    }

    if (rocketElites.length > 4) {
        rocketElites.sort((a, b) => b.fitness - a.fitness);
        rocketElites.splice(4, rocketElites.length);
    }

    rocketElites.forEach(r => {
        Matter.Body.setPosition(r.body, { x: random(0, width), y: random(0, 300) });
        Matter.Body.setVelocity(r.body, { x: 0, y: 0 });
        Matter.Body.setAngle(r.body, map(random(), 0, 1, -PI / 2, PI / 2));
        rockets.push(r)
    });
    Matter.World.add(engine.world, [...rockets.map(b => b.body)]);
}

function makeNextGenBrains() {

    const nextGen = []
    const maxNextGen = 10;
    if (nextGen.length < maxNextGen) {
        for (let i = 0; i < rocketElites.length; i++) {
            for (let j = 0; j < rocketElites.length; j++) {
                const parent1 = rocketElites[i];
                const parent2 = rocketElites[j];
                if (i !== j) {
                    const childBrain = neataptic.Network.crossOver(parent1.brain, parent2.brain);
                    nextGen.push({
                        parent: parent1,
                        childBrain
                    });
                }
            }
        }
    }

    return nextGen;
}

function filterFittest() {
    let maxFitn = maxFitness();
    Matter.World.remove(engine.world, [...rocketElites.map(r => r.body)]);
    rocketElites = [];
    for (let i = 0; i < rockets.length; i++) {
        const normalizedFitness = map(rockets[i].fitness, 0, maxFitn, 0, 1);
        if (normalizedFitness > 0.97) {
            rocketElites.push(copy(rockets[i]));
        }
    }

    // If none meets the bar randomly create 5 new population
    if (rocketElites.length == 0) {
        for (let i = 0; i < 4; i++) {
            rocketElites.push(new Box(random(0, width), random(0, 300), 30, 100, null, maxFitn * 0.5));
        }
    } else if (rocketElites.length == 1) { // add another one
        const randomRocket = copy(rockets[parseInt(random(0, rockets.length))]);
        randomRocket.setFitness(maxFitn * 0.5);
        rocketElites.push(randomRocket);
    }

    return maxFitn;


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

function showRocketInfos() {

}