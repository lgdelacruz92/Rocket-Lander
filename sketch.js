let bestRocket;
let count;
let fromGoatPlay;
let engine;
let generation;
let goatRocket;
let maxScore;
let rocketElites = [];
let rockets;
let prevGenScore;
let playGoat;

// * NUM_ROCKETS has to be a minimum of 100
const NUM_ROCKETS = 100;

// * Elitism number
const ELITISM = 5;

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
}

function draw() {
    background(0);

    if (!playGoat) {
        if (fromGoatPlay) {
            breedGoat();
            fromGoatPlay = false;
        }

        recordGeneration();
        recordMaxScore();
        recordPrevGenScore();
    
        for (let i = 0; i < rockets.length; i++) {
            rockets[i].draw();
            rockets[i].update();
        }
        if (count >= 300) {
            // Reward landed 
            rewardRocketsThatLanded();
            punishOutOfBounds();
            punishNonUprightRockets();

            // Show scores
            showScores();

            // Record fittest
            const maxFit = filterFittest();
            prevGenScore = maxFit;
            if (maxFit > maxScore) {
                maxScore = maxFit;
            }

            // Retrain
            saveGoat();
            initNextGenRockets();
    
            const numBodies = Matter.Composite.allBodies(engine.world);
            if (numBodies.length > 500) {
                console.log('Memory leak', numBodies);
            }
            count = 0;
            generation += 1;
        }
        count += 1;
    }
    else {
        goatRocket.draw();
        goatRocket.update();
        if (count >= 300) {
            count = 0;
        }
        count += 1;
    }
    noStroke();
    fill(255, 255, 0);
    rect(ground.position.x - width / 4, ground.position.y - 50, width / 2, 100);
}

function showScores() {
    const colorFitnessData = collectColorFitnessData(rockets);
    colorFitnessData.sort((a, b) => b.fitness - a.fitness);
    showRocketFitnesses(colorFitnessData);
}

/*
    Triggers for playing and stopping play goat
    @return void
 */
function keyPressed() {
    if (keyCode === ENTER) {
        runPlayGoat();
    } else if (keyCode === BACKSPACE) {
        continueTraining();
    }
}

/*
    If executed this will show only the goat
    @return void
*/
function runPlayGoat() {
    // Remove rockets
    Matter.World.remove(engine.world, [...rockets.map(r => r.body)]);
    rockets = [];
    // Remove elites
    Matter.World.remove(engine.world, [...rocketElites.map(r => r.body)]);
    rocketElites = [];
    // Play Goat
    Matter.World.add(engine.world, goatRocket.body);
    Matter.Body.setVelocity(goatRocket.body, { x: 0, y: 0 });
    Matter.Body.setPosition(goatRocket.body, { x: random(0, width), y: random(0, 300)});
    Matter.Body.setAngle(goatRocket.body, random(-PI/2, PI/2));
    playGoat = true;
}

/*
    Usually needed after seeing goat. Play again
    @return void
*/
function continueTraining() {
    // Make children from goat
    fromGoatPlay = true;
    // Set goat flag false
    playGoat = false;
    Matter.World.remove(engine.world, goatRocket.body);
}

function breedGoat() {
    for (let i = 0; i < NUM_ROCKETS - 1; i++) {
        const goatCopy = copy(goatRocket);
        goatCopy.brain.mutate(neataptic.methods.mutation.MOD_WEIGHT);
        rockets.push(goatCopy);
    }
}

function saveGoat() {
    if (!goatRocket) {
        goatRocket =  copy(rocketElites[0]);
    } else if (rocketElites[0].fitness > goatRocket.fitness) {
        goatRocket = copy(rocketElites[0]);
    }
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

function initNextGenRockets() {
    rockets.forEach(r => Matter.World.remove(engine.world, r.body));
    rockets = [];

    const nextGenBrains = makeNextGenBrains();
    if (nextGenBrains.length > 0) {
        let numNewRockets = 0;
        while (numNewRockets < NUM_ROCKETS - rocketElites.length) {
            const randomNextGenBrain = nextGenBrains[parseInt(random(0, nextGenBrains.length))];
            randomNextGenBrain.childBrain.mutate(neataptic.methods.mutation.MOD_WEIGHT);
            const babyRocket = new Box(random(0, width), random(0, 300), 30, 100, randomNextGenBrain.childBrain);
            babyRocket.setColor(randomNextGenBrain.parent.color);
            rockets.push(babyRocket);
            numNewRockets += 1;
        }

        rocketElites.forEach(r => {
            Matter.Body.setPosition(r.body, { x: random(0, width), y: random(0, 300) });
            Matter.Body.setVelocity(r.body, { x: 0, y: 0 });
            Matter.Body.setAngle(r.body, map(random(), 0, 1, -PI / 2, PI / 2));
            rockets.push(r)
        });

        rockets.forEach(r => {
            Matter.Body.setAngle(r.body, random(-PI / 2, PI / 2));
            r.setFitness(0);
        });

        Matter.World.add(engine.world, [...rockets.map(b => b.body)]);
    }
    else {
        initRockets();
    }
}

function makeNextGenBrains() {
    const nextGen = []
    const maxNextGen = 10;
    if (nextGen.length < maxNextGen && rocketElites.length > 0) {
        if (rocketElites.length === 1) {
            const babyRocket = new Box(random(0, width), random(0, 300), 30, 100);
            rocketElites.push(babyRocket);
        }

        if (rocketElites.length < 2) {
            throw Error("Error in rocket elites less than 2")
        }

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
    Matter.World.remove(engine.world, [...rocketElites.map(r => r.body)]);
    rocketElites = [];

    // take top 3
    rockets.sort((a, b) => b.fitness - a.fitness);
    for (let i = 0; i < ELITISM; i++) {
        rocketElites.push(copy(rockets[i]));
    }
    return rockets[0].fitness;
}

/*
    Rewards rockets that landed on the platform
    @return void
*/
function rewardRocketsThatLanded() {
    for (let i = 0; i < rockets.length; i++) {
        const rocketBody = rockets[i].body;
        if (200 <= rocketBody.x && rocketBody.x <= 600 && 600 <= rocketBody.y && rocketBody.y <= 700) {
            rockets[i].fitness += 5;
        }
    }
}

/*
    Punish rockets that are out of bounds
    @return void
*/
function punishOutOfBounds() {
    for (let i = 0; i < rockets.length; i++) {
        const rocketPos = rockets[i].body.position;
        if (rocketPos.x > width
            || rocketPos.x < 0
            || rocketPos.y < 0
            || rocketPos.y > height) {
            rockets[i].fitness -= 10;
        }
    }
}

/*
    Punish non upright rockets
    @return void
*/
function punishNonUprightRockets() {
    for (let i = 0; i < rockets.length; i++) {
        const rocketBody = rockets[i].body;
        if (rocketBody.angle > PI/2 || rocketBody.angle < -PI/2) {
            rockets[i].fitness -= 2;
        } else {
            rockets[i].fitness += 3;
        }
    }
}

function sigmoid(x) {
    const d = 1 + Math.pow(2.72, -x);
    return 1 / d;
}