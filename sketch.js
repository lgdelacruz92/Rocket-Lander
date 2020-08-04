let bestRocket;
let count;
let evaluationCount;
let fromGoatPlay;
let engine;
let generation;
let goatRocket;
let graphX;
let rocketImg;
let backgroundImg;
let maxScore;
let rocketElites = [];
let rockets;
let prevGenScore;
let playGoat;

// * NUM_ROCKETS has to be a minimum of 100
const NUM_ROCKETS = 100;

// * Elitism number
const ELITISM = 5;

function preload() {
    rocketImg = loadImage('rocket.png');
    backgroundImg = loadImage('Background.png');
}

const GOAT_BRAIN = {
    "nodes": [
        {
            "bias": 0.05806370892775098,
            "type": "input",
            "squash": "LOGISTIC",
            "mask": 1,
            "index": 0
        },
        {
            "bias": -0.08260303794761872,
            "type": "input",
            "squash": "LOGISTIC",
            "mask": 1,
            "index": 1
        },
        {
            "bias": 0.002043781689151869,
            "type": "input",
            "squash": "LOGISTIC",
            "mask": 1,
            "index": 2
        },
        {
            "bias": 0.09035840714145557,
            "type": "input",
            "squash": "LOGISTIC",
            "mask": 1,
            "index": 3
        },
        {
            "bias": 0.006980019130936599,
            "type": "input",
            "squash": "LOGISTIC",
            "mask": 1,
            "index": 4
        },
        {
            "bias": 0.020176537667746297,
            "type": "input",
            "squash": "LOGISTIC",
            "mask": 1,
            "index": 5
        },
        {
            "bias": -0.04919390473700563,
            "type": "hidden",
            "squash": "LOGISTIC",
            "mask": 1,
            "index": 6
        },
        {
            "bias": -0.008870471352111858,
            "type": "hidden",
            "squash": "LOGISTIC",
            "mask": 1,
            "index": 7
        },
        {
            "bias": 0.07282163847268727,
            "type": "hidden",
            "squash": "LOGISTIC",
            "mask": 1,
            "index": 8
        },
        {
            "bias": -0.05496344932649011,
            "type": "hidden",
            "squash": "LOGISTIC",
            "mask": 1,
            "index": 9
        },
        {
            "bias": 0.039614457848690554,
            "type": "hidden",
            "squash": "LOGISTIC",
            "mask": 1,
            "index": 10
        },
        {
            "bias": -0.09088359097731345,
            "type": "hidden",
            "squash": "LOGISTIC",
            "mask": 1,
            "index": 11
        },
        {
            "bias": 0.037852044544148755,
            "type": "hidden",
            "squash": "LOGISTIC",
            "mask": 1,
            "index": 12
        },
        {
            "bias": -0.06934211764845793,
            "type": "output",
            "squash": "LOGISTIC",
            "mask": 1,
            "index": 13
        },
        {
            "bias": -0.09210371261922963,
            "type": "output",
            "squash": "LOGISTIC",
            "mask": 1,
            "index": 14
        },
        {
            "bias": -0.06806916369633004,
            "type": "output",
            "squash": "LOGISTIC",
            "mask": 1,
            "index": 15
        }
    ],
    "connections": [
        {
            "weight": 0.07716299817459774,
            "from": 12,
            "to": 15,
            "gater": null
        },
        {
            "weight": -0.08303578597548289,
            "from": 11,
            "to": 15,
            "gater": null
        },
        {
            "weight": 0.5505640545353856,
            "from": 12,
            "to": 14,
            "gater": null
        },
        {
            "weight": -0.09361307357632045,
            "from": 10,
            "to": 15,
            "gater": null
        },
        {
            "weight": 0.18712868130173713,
            "from": 11,
            "to": 14,
            "gater": null
        },
        {
            "weight": -1.232080361205,
            "from": 12,
            "to": 13,
            "gater": null
        },
        {
            "weight": 0.17350135265584682,
            "from": 9,
            "to": 15,
            "gater": null
        },
        {
            "weight": -0.06980676960019255,
            "from": 10,
            "to": 14,
            "gater": null
        },
        {
            "weight": -0.2110537641979514,
            "from": 11,
            "to": 13,
            "gater": null
        },
        {
            "weight": 0.018017536682856244,
            "from": 8,
            "to": 15,
            "gater": null
        },
        {
            "weight": -0.5772046193292122,
            "from": 9,
            "to": 14,
            "gater": null
        },
        {
            "weight": -1.476738457539143,
            "from": 10,
            "to": 13,
            "gater": null
        },
        {
            "weight": 0.2096720757875845,
            "from": 7,
            "to": 15,
            "gater": null
        },
        {
            "weight": -0.042780290655671044,
            "from": 8,
            "to": 14,
            "gater": null
        },
        {
            "weight": 0.720701570325579,
            "from": 9,
            "to": 13,
            "gater": null
        },
        {
            "weight": -0.14582750319807136,
            "from": 6,
            "to": 15,
            "gater": null
        },
        {
            "weight": 0.5359424682382639,
            "from": 7,
            "to": 14,
            "gater": null
        },
        {
            "weight": -0.2975617036232345,
            "from": 8,
            "to": 13,
            "gater": null
        },
        {
            "weight": -0.8405519814796312,
            "from": 6,
            "to": 14,
            "gater": null
        },
        {
            "weight": -0.07359694314370291,
            "from": 7,
            "to": 13,
            "gater": null
        },
        {
            "weight": -0.4526968800356868,
            "from": 6,
            "to": 13,
            "gater": null
        },
        {
            "weight": -0.28607522780670175,
            "from": 5,
            "to": 12,
            "gater": null
        },
        {
            "weight": -0.7549911064420445,
            "from": 4,
            "to": 12,
            "gater": null
        },
        {
            "weight": 0.1005266465633553,
            "from": 5,
            "to": 11,
            "gater": null
        },
        {
            "weight": 0.13855986962083,
            "from": 3,
            "to": 12,
            "gater": null
        },
        {
            "weight": -1.5189543444121858,
            "from": 4,
            "to": 11,
            "gater": null
        },
        {
            "weight": -1.358805430759618,
            "from": 5,
            "to": 10,
            "gater": null
        },
        {
            "weight": -0.42428037163901633,
            "from": 2,
            "to": 12,
            "gater": null
        },
        {
            "weight": 0.5045955086197238,
            "from": 3,
            "to": 11,
            "gater": null
        },
        {
            "weight": 0.877688396173119,
            "from": 4,
            "to": 10,
            "gater": null
        },
        {
            "weight": -0.08148277741365555,
            "from": 5,
            "to": 9,
            "gater": null
        },
        {
            "weight": -0.8550629643621783,
            "from": 1,
            "to": 12,
            "gater": null
        },
        {
            "weight": 0.4218237882831479,
            "from": 2,
            "to": 11,
            "gater": null
        },
        {
            "weight": -0.0170734934659397,
            "from": 3,
            "to": 10,
            "gater": null
        },
        {
            "weight": 0.028482480781024222,
            "from": 4,
            "to": 9,
            "gater": null
        },
        {
            "weight": -0.7606551176101549,
            "from": 5,
            "to": 8,
            "gater": null
        },
        {
            "weight": 0.026716269458651798,
            "from": 0,
            "to": 12,
            "gater": null
        },
        {
            "weight": -0.06409532184423546,
            "from": 1,
            "to": 11,
            "gater": null
        },
        {
            "weight": -0.37244489373345935,
            "from": 2,
            "to": 10,
            "gater": null
        },
        {
            "weight": -0.49875928424196114,
            "from": 3,
            "to": 9,
            "gater": null
        },
        {
            "weight": -0.7267466865291816,
            "from": 4,
            "to": 8,
            "gater": null
        },
        {
            "weight": -0.9536766118520642,
            "from": 5,
            "to": 7,
            "gater": null
        },
        {
            "weight": 0.3871646346718288,
            "from": 0,
            "to": 11,
            "gater": null
        },
        {
            "weight": 0.06425068497686345,
            "from": 1,
            "to": 10,
            "gater": null
        },
        {
            "weight": -0.10853143993773584,
            "from": 2,
            "to": 9,
            "gater": null
        },
        {
            "weight": 0.018163974262684318,
            "from": 3,
            "to": 8,
            "gater": null
        },
        {
            "weight": -1.0132144781285723,
            "from": 4,
            "to": 7,
            "gater": null
        },
        {
            "weight": -1.0325913048388762,
            "from": 5,
            "to": 6,
            "gater": null
        },
        {
            "weight": -0.03653538411630644,
            "from": 0,
            "to": 10,
            "gater": null
        },
        {
            "weight": 0.6947314293980811,
            "from": 1,
            "to": 9,
            "gater": null
        },
        {
            "weight": -0.9483839266092823,
            "from": 2,
            "to": 8,
            "gater": null
        },
        {
            "weight": -0.4299808686700355,
            "from": 3,
            "to": 7,
            "gater": null
        },
        {
            "weight": -0.19420646112950013,
            "from": 4,
            "to": 6,
            "gater": null
        },
        {
            "weight": -0.5005166459910596,
            "from": 0,
            "to": 9,
            "gater": null
        },
        {
            "weight": 0.3299823335913883,
            "from": 1,
            "to": 8,
            "gater": null
        },
        {
            "weight": -1.0463393511351475,
            "from": 2,
            "to": 7,
            "gater": null
        },
        {
            "weight": 1.661771690473321,
            "from": 3,
            "to": 6,
            "gater": null
        },
        {
            "weight": 0.4080349451414211,
            "from": 0,
            "to": 8,
            "gater": null
        },
        {
            "weight": 0.9469012918497071,
            "from": 1,
            "to": 7,
            "gater": null
        },
        {
            "weight": -1.1400354293277215,
            "from": 2,
            "to": 6,
            "gater": null
        },
        {
            "weight": -0.021802554640736188,
            "from": 0,
            "to": 7,
            "gater": null
        },
        {
            "weight": -0.01324981085807675,
            "from": 1,
            "to": 6,
            "gater": null
        },
        {
            "weight": 0.9202995432862033,
            "from": 0,
            "to": 6,
            "gater": null
        }
    ],
    "input": 6,
    "output": 3,
    "dropout": 0
}

function setup() {
    const canvas = createCanvas(800, 800);
    canvas.parent('viewport');
    engine = Matter.Engine.create();

    initRockets(GOAT_BRAIN);

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
        if (count >= 500) {

            if (evaluationCount % 5 === 0 && evaluationCount !== 0) {
                // Show scores
                showScores();

                // Record fittest
                const maxFit = filterFittest();
                prevGenScore = maxFit;
                if (maxFit > maxScore) {
                    maxScore = maxFit;
                }

                initNextGenRockets();
        
                const numBodies = Matter.Composite.allBodies(engine.world);
                if (numBodies.length > 500) {
                    console.log('Memory leak', numBodies);
                }
                generation += 1;
                evaluationCount = 0;
            } else {
                // Randomize the position of the rockets again
                randomizeRocketPosition();   
            }
            evaluationCount += 1;
            count = 0;
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
    stroke(0);
    strokeWeight(2);
    fill(200, 200, 200);
    rect(ground.position.x - width / 4, ground.position.y - 50, width / 2, 100);
    drawWater();
}

/*
    Randomizes the position of the rockets all over again
    @return void
*/
function randomizeRocketPosition() {
    for (let i = 0; i < rockets.length; i++) {
        Matter.Body.setPosition(rockets[i].body, {x: randomX(), y: random(0, 300)});
        Matter.Body.setVelocity(rockets[i].body, {x: 0, y: 0});
        Matter.Body.setAngle(rockets[i].body, 0);
    }
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
    Matter.Body.setPosition(goatRocket.body, { x: randomX(), y: random(0, 300) });
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
        goatCopy.brain.mutate(neataptic.methods.mutation.FFW);
        rockets.push(goatCopy);
    }
}

function saveGoat(topTen) {
    if (!goatRocket) {
        goatRocket =  copy(topTen[0]);
        goatRocket.setFitness(topTen[0].fitness);
    } else if (topTen[0].fitness > goatRocket.fitness) {
        goatRocket = copy(topTen[0]);
        goatRocket.setFitness(topTen[0].fitness);
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

function initRockets(goatBrain) {
    rockets = [];

    for (let i = 0; i < NUM_ROCKETS; i++) {
        const newRocket = new Box(randomX(), random(0, 300), 30, 100, neataptic.Network.fromJSON(goatBrain));
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

function initNextGenRockets() {
    rockets.forEach(r => Matter.World.remove(engine.world, r.body));
    rockets = [];

    const nextGenBrains = makeNextGenBrains();
    if (nextGenBrains.length > 0) {
        let numNewRockets = 0;
        while (numNewRockets < NUM_ROCKETS - rocketElites.length) {
            const randomNextGenBrain = nextGenBrains[parseInt(random(0, nextGenBrains.length))];
            randomNextGenBrain.childBrain.mutate(neataptic.methods.mutation.MOD_WEIGHT);
            const babyRocket = new Box(randomX(), random(0, 300), 30, 100, randomNextGenBrain.childBrain);
            babyRocket.setColor(randomNextGenBrain.parent.color);
            rockets.push(babyRocket);
            numNewRockets += 1;
        }

        rocketElites.forEach(r => {
            Matter.Body.setPosition(r.body, { x: 100, y: 100 });
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
            const babyRocket = new Box(randomX(), random(0, 300), 30, 100);
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


    // Make sure to save the goat
    rockets.sort((a, b) => b.fitness - a.fitness);
    saveGoat(rockets);

    for (let i = 0; i < ELITISM; i++) {
        rocketElites.push(copy(rockets[i]));
    }

    let eliteAvgFitness = 0;
    for (let i = 0; i < rockets.length; i++) {
        eliteAvgFitness += rockets[i].fitness;
    }
    eliteAvgFitness /= rockets.length;
    myChart.data.datasets[0].data.push({x: graphX, y: eliteAvgFitness});
    myChart.update();
    graphX += 1;
    
    return rockets[0].fitness;
}

function sigmoid(x) {
    const d = 1 + Math.pow(2.72, -x);
    return 1 / d;
}