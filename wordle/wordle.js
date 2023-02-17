 
async function getDict() {   

    const res = await fetch("https://api.masoudkf.com/v1/wordle", {
    headers: {
    "x-api-key": "sw0Tr2othT1AyTQtNDUE06LqMckbTiKWaVYhuirv",
    },
    });
    
    
    if (res.ok) {
        let data = await res.json();
        data = data["dictionary"];
        return data;
    }
}


const WORD_SIZE = 4;
let guessesRemaining = 6; //How many guess the user has left
let guess_number = 0; //the current guess attempt the user is on
let guessLetters = 0; //how many letters have been entered in the current guess attempt
let currentGuess = ""; //current string of the guess
let selected_guess; //dictionary object holding current games word and hint


async function initGame() {
    

    let reset_btn = document.getElementById("start-over");
    reset_btn.children[1].style.display = "none";
    //create board and append to game area
    let game_area = document.getElementById("game-area");
    let board = document.createElement("div");
    board.id = "wordle-box";
    game_area.appendChild(board);
    
    //choose word and hint from dictionary
    rand_number = Number.parseInt(Math.random() * 20);
    selected_guess = dictionary[rand_number];
    
    //creates 4x6 grid
    for (let i = 0; i < 6; i++) {
        let row = document.createElement("div");
        row.className = "letter-row"
        row.setAttribute("id", i);

        for (let j = 0; j < WORD_SIZE; j++) {
            const grid_item = document.createElement("div");
            grid_item.className = "grid-cell";
            grid_item.setAttribute("id", j);
            if (j == 0 && i == 0) grid_item.classList.add("next-cell");
            row.appendChild(grid_item);
        }
        board.appendChild(row);
    } 

    reset_btn.children[0].style.display = "none";
    reset_btn.children[1].style.display = "";
    
}

function insertLetter(key) {
    //inserts letter into wordle cells
    if (guessLetters == WORD_SIZE) {
        return;
    }
    
    let guess_row = document.getElementsByClassName('letter-row')[guess_number];
    let cell_to_insert = guess_row.children[guessLetters];

    cell_to_insert.textContent = key;
    cell_to_insert.classList.add("filled-cell");
    cell_to_insert.classList.remove("next-cell")

    currentGuess += key;
    guessLetters += 1;

    if (guessLetters != WORD_SIZE) guess_row.children[guessLetters].classList.add("next-cell");
}

function deleteLetter() {
    
    if (guessLetters == 0) return;
    
    
    guessLetters -= 1;
    currentGuess = currentGuess.slice(0, guessLetters-1);

    let guess_row = document.getElementsByClassName('letter-row')[guess_number];
    let cell_to_delete = guess_row.children[guessLetters];
    cell_to_delete.textContent = null;
    cell_to_delete.classList.remove("filled-cell");
    if (guess_row.children[guessLetters+1] != null)
    guess_row.children[guessLetters+1].classList.remove("next-cell");
    cell_to_delete.classList.add("next-cell");
    
}


//Keypress handling
document.addEventListener('keyup', (keypress) => {
    let key = keypress.key;
    try {
        key.toLowerCase();
    } catch (e) {}
    

    if (key == "Backspace") {
        deleteLetter();
    }
    else if (key == "Enter") {
        if (guessLetters != WORD_SIZE) {
            window.alert("You must complete the word first!");
            return;
        }
        if (checkGuess() == true) {
            return;
        }
        else {
            guess_number += 1;
            guessesRemaining -= 1;
            if (guessesRemaining == 0) {
                loseGame();
                return;
            } 
            guessLetters = 0;
            const next_guess = document.getElementsByClassName("letter-row")[guess_number];
            next_guess.children[0].classList.add("next-cell");
        }
    }
    else if (key.match(RegExp(/^[a-zA-Z]$/))) {
        insertLetter(key);
    }
});

function checkGuess() {
    
    let guess = document.getElementsByClassName("letter-row")[guess_number];
    let word = selected_guess["word"].toLowerCase();

    if (currentGuess.toLowerCase() == word) {
        winScreen();
        return true;
    }
    else {
        for (let i = 0; i < WORD_SIZE; i++) {
            
            let cell = guess.children[i];
            let guess_char = cell.textContent.toLowerCase();
            let actual_char = word[i];
            
            if (guess_char == actual_char) {
                cell.classList.add("correct-cell");
            }
            else if (word.includes(guess_char)) {
                cell.classList.add("yellow-cell");
            }
        }
    }
    currentGuess = "";
    return false;
}

function winScreen() {
    
    document.getElementById("wordle-box").style.display = "none";
    
    let win_div = document.getElementById("win-screen");
    win_div.style.display = "flex";

    document.getElementById("game-area").appendChild(win_div);

    let win_info = document.createElement("div");
    win_info.id = "win-info";
    win_info.appendChild(document.createElement("p"))
    win_info.firstChild.innerHTML = "You guessed the word " + `<b id="win-word">${selected_guess["word"]}</b>` + " correctly!";

    document.getElementById("game-area").appendChild(win_info);

}

function loseGame() {
    let lose_info = document.createElement("div");
    lose_info.id = "lose-info";
    lose_info.appendChild(document.createElement("p"))
    lose_info.firstChild.innerHTML = "You missed the word " + `<b id="win-word">${selected_guess["word"]}</b>` + " and lost!";

    document.getElementById("game-area").appendChild(lose_info);
}

function restartGame() {

    document.getElementById("reset-button").blur();
    
    //reset values
    guessesRemaining = 6;
    guess_number = 0;
    guessLetters = 0;    
    currentGuess = "";

    //select new word and hint
    let rand_number = Number.parseInt(Math.random() * 20);
    selected_guess = dictionary[rand_number];

    let row = document.getElementsByClassName("letter-row");
    for (let i = 0; i < 6; i++) {
        for (let j = 0; j < WORD_SIZE; j++) {
            let cell = row[i].children[j];
            cell.textContent = null;
            cell.classList.remove("filled-cell");
            cell.classList.remove("next-cell");
            cell.classList.remove("correct-cell");
            cell.classList.remove("green-cell");
            cell.classList.remove("yellow-cell");
        }
    }
    row[0].children[0].classList.add("next-cell");

    try {
        document.getElementById("hint-div").style.display = "none";
    } catch (e) {}
    document.getElementById("win-screen").style.display = "none";
    document.getElementById("wordle-box").style.display = "flex";

    try {
        document.getElementById("lose-info").remove();
    } catch (e) {}

    try {
        document.getElementById("win-info").remove();
    } catch (e) {}
}

function displayHint() {
    let game_area = document.getElementById("game-area");
    
    document.getElementById("hint-button").blur();

    let hint_div = document.getElementById("hint-div")

    if (hint_div != null) {
        if (hint_div.style.display == "none") {
            hint_div.style.display = "flex";
            hint_div.textContent = "Hint: " + selected_guess["hint"];
        }
        else {
            hint_div.style.display = "none";
        }
    }
    else {
        hint_div = document.createElement("div");
        hint_div.id = "hint-div";
        hint_div.textContent = "Hint: " + selected_guess["hint"];
        game_area.appendChild(hint_div);
    }
    
}

function displayInfo() {
    const info = document.getElementById("game-info");

    document.getElementById("info-button").blur();

    if (info.style.display == "none") {
        info.style.display = "flex";
    }
    else {
        info.style.display = "none";
    }
}


function toggleDarkMode() {

    document.getElementById("dark-button").blur();

    let html = document.querySelector("html");
    let buttons = document.getElementsByClassName("header-buttons")[0];
    let game = document.getElementById("wordle-box");
    if (html.id != "dark-mode") {
        html.id = "dark-mode";
        buttons.children[0].id = "dark-mode";
        buttons.children[1].id = "dark-mode";
        buttons.children[2].id = "dark-mode";
    }
    else {
        html.id = "";
        buttons.children[0].id = "";
        buttons.children[1].id = "";
        buttons.children[2].id = "";
    }
}

let dictionary;

async function main() {
    dictionary = await getDict();
    await initGame(dictionary);
}

main();