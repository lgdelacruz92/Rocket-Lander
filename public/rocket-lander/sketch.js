let backgroundImg;
let count;
let engine;
let rocketImg;
let rockets;
let generation;

// * NUM_ROCKETS has to be a minimum of 100
const NUM_ROCKETS = 100;

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
}

function draw() {
    image(backgroundImg, 0, 0);

    for (let i = 0; i < rockets.length; i++) {
        try {
            rockets[i].draw();
            rockets[i].update();
            if (rockets[i].outOfBounds()) {
                removeRocket(i);
            }
        }
        catch (err) {
            console.log('Error in one frocket');
            removeRocket(i);
        }
    }
    if (count >= 500) {
        // Speciation
        const speciesGroups = getSpeciesGroups(rockets);
        sortSpeciesGroups(speciesGroups);
        killPercentagePerSpecies(speciesGroups, 1 - 0.5);
        writeRocketAvg();
        makeNewGenerationFromLast(speciesGroups);
        writeGenerationNumber();
        resetAllRockets();
        count = 0;
    }
    count += 1;

    drawGround();
    drawWater();
}

/**
 * Writes the rocket avg chart
 */
function writeRocketAvg() {
    myChart.data.datasets[0].data.push({x: generation, y: getAvgFitness() });
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
 * Makes new generation from species groups
 * @param {Array} speciesGroups Array of species groups
 */
function makeNewGenerationFromLast(speciesGroups) {
    const flatArrayOfRockets = flatten(speciesGroups);

    if (flatArrayOfRockets.length < 2) {
        throw Error('Not enough rockets survived.');
    }

    while (rockets.length < NUM_ROCKETS) {
        const index1 = parseInt(Math.floor(random(0, flatArrayOfRockets.length)));
        let index2 = parseInt(Math.floor(random(0, flatArrayOfRockets.length)));
        while (index2 === index1) {
            index2 = parseInt(Math.floor(random(0, flatArrayOfRockets.length)));
        }
        const parentRocket1 = rockets[index1];
        const parentRocket2 = rockets[index2];
        rockets.push(parentRocket1.mate(parentRocket2));
    }
    speciesGroups = [];
}

/**
 * Sorts each species based on their fitness
 * @param {Array} speciesGroups Species groups
 */
function sortSpeciesGroups(speciesGroups) {
    for (let i = 0; i < speciesGroups.length; i++) {
        speciesGroups[i].sort((a, b) => b.fitness - a.fitness);
    }
}

/**
 * Kills 50 % of each species group
 * @param {Array} speciesGroups Species groups
 */
function killPercentagePerSpecies(speciesGroups, percentage) {
    for (let i = 0; i < speciesGroups.length; i++) {
        const percentageOfSpecies = parseInt(Math.floor(speciesGroups[i].length * percentage));
        if (speciesGroups[i].length === 0) {
            throw Error('Something went wrong. Species group can not be zero.');
        }
        for (let j = percentageOfSpecies; j < speciesGroups[i].length; j++) {
            removeRocket(getRocketIndex(speciesGroups[i][j].id));
        }
        speciesGroups[i].splice(percentageOfSpecies);
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
 * Get species groups
 * @param {Array} rockets Array of rockets
 */
function getSpeciesGroups(rockets) {
    const speciesGroups = [];

    const alreadyBelongToASpecies = {};
    for (let i = 0; i < rockets.length; i++) {
        if (alreadyBelongToASpecies[i] === undefined) {
            const species = [rockets[i]]
            alreadyBelongToASpecies[i] = true;
            for (let j = 0; j < rockets.length; j++) {
                const speciesDiff = rockets[i].dist(rockets[j]);
                if (i !== j && speciesDiff < 0.3 && alreadyBelongToASpecies[j] === undefined) {
                    species.push(rockets[j])
                    alreadyBelongToASpecies[j] = true;
                }
            }
            speciesGroups.push(species);
        }
    }
    return speciesGroups;
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