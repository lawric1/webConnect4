import { Vector2, clamp } from "./math.js";

export class RectangleCollisionShape2D {
    constructor(x, y, width, height) {
        this.position = new Vector2(x, y);
        this.width = width;
        this.height = height;
        this.overlap = true;
    }

    updatePosition(vector) {
        this.position = vector.clone();
    }

    toString() {
        return "\nRectangleCollisionShape2D";
    }
}

export class CircleCollisionShape2D {
    constructor(x, y, radius) {
        this.position = new Vector2(x, y);
        this.radius = radius;
    }

    updatePosition(vector) {
        this.position = vector.clone();
    }

    toString() {
        return "\nCircleCollisionShape2D";
    }
}


// This is a bit of a mess right now, but it'll work for a naive collission detection.
export function checkCollision(shape1, shape2) {
    let pointRect = shape1 instanceof Vector2 && shape2 instanceof RectangleCollisionShape2D;
    let pointCircle = shape1 instanceof Vector2 && shape2 instanceof CircleCollisionShape2D;
    let rectRect = shape1 instanceof RectangleCollisionShape2D && shape2 instanceof RectangleCollisionShape2D;
    let circleCircle = shape1 instanceof CircleCollisionShape2D && shape2 instanceof CircleCollisionShape2D;
    let rectCircle = shape1 instanceof RectangleCollisionShape2D && shape2 instanceof CircleCollisionShape2D;
    let circleRect = shape2 instanceof RectangleCollisionShape2D && shape1 instanceof CircleCollisionShape2D;

    if (pointRect) {
        return checkPointRect(shape1, shape2);
    } else if (pointCircle) {
        return checkPointCircle(shape1, shape2);
    } else if (rectRect) {
        return checkRectRect(shape1, shape2);
    } else if (circleCircle) {
        return checkCircleCircle(shape1, shape2);
    } else if (rectCircle) {
        return checkRectCircle(shape1, shape2);
    } else if (circleRect) {
        return checkCircleRect(shape1, shape2);
    } else {
        console.log(shape1.toString(), "and ", shape2.toString(), "\nCollission is not valid");
    }

    return false;
}

function checkPointRect(point, rect) {
    let withinX = point.x > rect.position.x && point.x < rect.position.x + rect.width;
    let withinY = point.y > rect.position.y && point.y < rect.position.y + rect.height;
    
    return withinX && withinY;
}

function checkPointCircle(point, circle) {
    let d = point.squaredDistanceTo(circle.position);
    return d <= circle.radius ** 2;
}

function checkRectRect(rect1, rect2) {
    let [x1, y1, width1, height1] = [rect1.position.x, rect1.position.y, rect1.width, rect1.height]; 
    let [x2, y2, width2, height2] = [rect2.position.x, rect2.position.y, rect2.width, rect2.height];

    let horizontalOverlap = (x1 < x2 + width2) && (x1 + width1 > x2)
    let verticalOverlap = (y1 < y2 + height2) && (y1 + height1 > y2)

    return horizontalOverlap && verticalOverlap
}

function checkCircleCircle(circle1, circle2) {
    let d = circle1.position.squaredDistanceTo(circle2.position);
    return d <= (circle1.radius + circle2.radius) ** 2;
}

function checkRectCircle(rect, circle) {
    let [rectX, rectY, rectWidth, rectHeight] = [rect.position.x, rect.position.y, rect.width, rect.height];
    let [circleX, circleY, circleRadius] = [circle.position.x, circle.position.y, circle.radius];
    // Case 1: Circle center inside the rectangle
    if (circleX >= rectX && circleX <= rectX + rectWidth &&
        circleY >= rectY && circleY <= rectY + rectHeight) {
        return true;
    }

    // Case 2: Circle center outside the rectangle
    const closestX = clamp(circleX, rectX, rectX + rectWidth);
    const closestY = clamp(circleY, rectY, rectY + rectHeight);
    const distance = 
        (closestX - circleX) ** 2 + 
        (closestY - circleY) ** 2;

    return distance <= circleRadius ** 2;
}

function checkCircleRect(circle, rect) {
    let [rectX, rectY, rectWidth, rectHeight] = [rect.position.x, rect.position.y, rect.width, rect.height];
    let [circleX, circleY, circleRadius] = [circle.position.x, circle.position.y, circle.radius];
    // Case 1: Circle center inside the rectangle
    if (circleX >= rectX && circleX <= rectX + rectWidth &&
        circleY >= rectY && circleY <= rectY + rectHeight) {
        return true;
    }

    // Case 2: Circle center outside the rectangle
    const closestX = clamp(circleX, rectX, rectX + rectWidth);
    const closestY = clamp(circleY, rectY, rectY + rectHeight);
    const distance = 
        (closestX - circleX) ** 2 + 
        (closestY - circleY) ** 2;

    return distance <= circleRadius ** 2;
}


function resolveCollision() {
}
