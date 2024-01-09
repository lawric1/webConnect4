// Wait some time before executing a callback
export async function delay(time) {
    return new Promise(resolve => setTimeout(resolve, time));
}

// Shuffle array elements
export function shuffle(array) {
    let currentIndex = array.length,  randomIndex;
  
    // While there remain elements to shuffle.
    while (currentIndex > 0) {
  
      // Pick a remaining element.
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex--;
  
      // And swap it with the current element.
      [array[currentIndex], array[randomIndex]] = [
        array[randomIndex], array[currentIndex]];
    }
  
    return array;
}

// Pick random item from list
export function choose(list) {
    return list[Math.floor((Math.random()*list.length))];
}

// Check if char is alphabetic
export function isAlpha(char) {
    return /^[a-zA-Z]$/.test(char);
}

export function fillArray(length) {
    return Array.from({length: length}, (x, i) => i);
}

export function shapeArray(flatArray, numRows, numCols) {
    if (flatArray.length !== numRows * numCols) {
        throw new Error("Invalid flat array length for shaping into the specified array dimensions.");
    }

    const newArray = [];
    for (let row = 0; row < numRows; row++) {
        newArray[row] = [];
        for (let col = 0; col < numCols; col++) {
            newArray[row][col] = flatArray[row * numCols + col];
        }
    }
    return newArray;
}