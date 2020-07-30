const rotatea = (a, angle) => {
    return {
        x: a.x * cos(angle) - a.y * sin(angle),
        y: a.x * sin(angle) + a.y * cos(angle)
    }
}

const getTopPoint = (rectangle, angle) => {
    const rectNormalizedTop = { x: 0, y: -rectangle.h / 2 };
    const rotation = rotatea(rectNormalizedTop, angle);
    return { x: rectangle.x + rotation.x, y: rectangle.y + rotation.y };
}

const getVerticalVector = (rectangle, angle) => {
    const topPoint = getTopPoint(rectangle, angle);
    return { x: topPoint.x - rectangle.x, y: topPoint.y - rectangle.y };
}

const getOrthogonalTopUnitVector = (rectangle, angle) => {
    console.log(rectangle, angle);
    const verticalVector = getVerticalVector(rectangle, angle);
    const vec = createVector(-verticalVector.y, verticalVector.x);
    return vec.div(vec.mag()).mult(-1);
}