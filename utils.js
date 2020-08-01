const rotatea = (a, angle) => {
    return {
        x: a.x * cos(angle) - a.y * sin(angle),
        y: a.x * sin(angle) + a.y * cos(angle)
    }
}

const dot = (a, b) => {
    return (a.x * b.x + a.y * b.y);
}

const mag = (a) => {
    return Math.sqrt(a.x * a.x + a.y * a.y);
}

const getTopPoint = (rectangle, angle) => {
    const rectNormalizedTop = { x: 0, y: -rectangle.h / 2 };
    const rotation = rotatea(rectNormalizedTop, angle);
    return { x: rectangle.x + rotation.x, y: rectangle.y + rotation.y };
}

const getBottomPoint = (rectangle, angle) => {
    const rectNormalizedTop = { x: 0, y: rectangle.h / 2 };
    const rotation = rotatea(rectNormalizedTop, angle);
    return { x: rectangle.x + rotation.x, y: rectangle.y + rotation.y };
}


const getVerticalVector = (rectangle, angle) => {
    const topPoint = getTopPoint(rectangle, angle);
    return createVector(topPoint.x - rectangle.x, topPoint.y - rectangle.y);
}

const getOrthogonalTopUnitVector = (rectangle, angle) => {
    const verticalVector = getVerticalVector(rectangle, angle);
    const vec = createVector(-verticalVector.y, verticalVector.x);
    return vec.div(vec.mag()).mult(-1);
}

const copy = (box) => {
    const newRocket = new Box(box.body.position.x, box.body.position.y, box.w, box.h, box.brain, box.fitness);
    return newRocket;
}

const getRocketInfo = () => {
    return document.querySelector('.rocket-infos');
}

/*
    Makes a rocket element in the form of
    <div class="rocket-info">
        <div class="color"></div>
        <span class="score"></span>
    </div>
*/
const makeRocketInfoEl = () => {
    const rocketInfoEl = document.createElement('div');
    const colorEl = document.createElement('color');
    const score = document.createElement('span');

    rocketInfoEl.setAttribute('class', 'rocket-info');
    colorEl.setAttribute('class', 'color');
    score.setAttribute('class', 'score');

    rocketInfoEl.appendChild(colorEl);
    rocketInfoEl.appendChild(score);
    return rocketInfoEl;
}

/*
    Makes rgb(200, 200, 200) from color object in format
    {
        r: 200,
        g: 200,
        b: 200
    }
*/
const makeRGBfromDataColor = color => {
    return `background: rgb(${color.r}, ${color.g}, ${color.b})`;
}

/*
    Shows the rocket fitness in the reporting
    Example data => [{
        color: {
            r: 200, 
            g: 200, 
            b: 200
        },
        fitness: 3000
    }]
    @data {Object} 
*/
const showRocketFitnesses = (data) => {
    const rocketInfos = getRocketInfo();
    rocketInfos.innerHTML = '';
    for (let i = 0; i < Math.min(data.length, 10); i++) {
        const rocketInfoEl = makeRocketInfoEl();
        rocketInfoEl.querySelector('.color')
            .setAttribute('style', makeRGBfromDataColor(data[i].color));
        rocketInfoEl.querySelector('.score').innerHTML = `${data[i].fitness}`;
        rocketInfos.appendChild(rocketInfoEl);
    }
}

/*
    Collects an array of Box objects and converts to color fitness data
    {
        color: {
            r: 200,
            g: 200,
            b: 200
        },
        fitness: 2000
    }
    @rockets {Array of Box objects}
    @return example [
        {
            color: {
                r: 200,
                g: 200,
                b: 200
            },
            fitness: 2000
        }
    ]
*/
const collectColorFitnessData = (rockets) => {
    const data = [];
    for (let i = 0; i < rockets.length; i++) {
        data.push({
            color: {
                r: rockets[i].color.x,
                g: rockets[i].color.y,
                b: rockets[i].color.z,
            },
            fitness: rockets[i].fitness
        });
    }
    return data;
}


/*
    Clamps a number between upper and lower bound
    @v value
    @l lowerbound
    @u upperbound
*/

const clamp = (v, l, u) => {
    if (v > u) {
        v = u;
    } else if (v < l) {
        v = u;
    } else {
        return v;
    }
}