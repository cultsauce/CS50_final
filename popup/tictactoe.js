let max = 'X', min = 'O';
// the internal board that is used for the logic behind the entire thing
let board = [0, 1, 2,
             3, 4, 5,
             6, 7, 8];

const win_combinations = [[0, 1, 2], [3, 4, 5], [6, 7, 8], [0, 3, 6], [1, 4, 7], [2, 5, 8], [0, 4, 8], [2, 4, 6]]
const move_ids = ["top-left", "top-middle", "top-right", "middle-left", "middle-middle", "middle-right", "bottom-left", "bottom-middle", "bottom-right"];
let game_info = {"started": false, "rounds": 1, "player": 0, "computer": 0, "tie": 0};


// check if the specified player won this game and if true, also return the winning combination
function hasWon(board, player)
{
    let count;
    for (let i = 0; i < win_combinations.length; i++)
    {
        count = 0;
        for (let j = 0; j < win_combinations[i].length; j++)
        {
            if (board[win_combinations[i][j]] == player)
            {
                count++;
                continue;
            }
            break;
        }
        if (count == 3)
        {
            return [true, win_combinations[i]];
        }
    }
    return [false];
}

// helper function to find all possible moves on a board
function availableMoves(board)
{
    let moves = [];
    for (let i = 0; i < board.length; i++)
    {
        if (board[i] != max && board[i] != min)
        {
            moves.push(board[i]);
        }
    }
    return moves;
}

// helper function to find if a game os over
function gameOver(board)
{
    if (hasWon(board, min)[0] || hasWon(board, max)[0] || availableMoves(board).length == 0)
    {
        return true;
    }
    else
    {
        return false;
    }
}

// the logic behind the computer's move
function minimax(board_now, is_maximizing, depth)
{
    // recursive base-case - return the score the player can reach following this path
    if (gameOver(board_now))
    {
        if (hasWon(board_now, max)[0])
        {
            return [10 - depth];
        }
        else if (hasWon(board_now, min)[0])
        {
            return [depth - 10];
        }
        else
        {
            return [0];
        }
    }

    // variables to store the best move and all possible moves the player can take
    let best_move;
    let best_moves = [];
    let moves = availableMoves(board_now);

    // check if we want to maximize the current score
    if (is_maximizing == true)
    {
        // this can be any very negative number
        let best_score = -666;
        for (let i = 0; i < moves.length; i++)
        {
            // make move on the board with the current player
            board_now[moves[i]] = max;

            // recursively find the outcome of the game on that board
            new_score = minimax(board_now, false, depth++)[0];

            let this_score;
            board_now[moves[i]] = min;
            if (hasWon(board_now, min)[0])
            {
                this_score = 10 - depth - 1;
                if (new_score < this_score) new_score = this_score;
            }
            
            if (new_score > best_score)
            {
                best_score = new_score;
                best_move = moves[i];
                best_moves = [moves[i]];
            }
            else if (new_score == best_score)
            {
                best_moves.push(moves[i]);
            }
            // revert board to its previous state (no deep-copy needed)
            board_now[moves[i]] = moves[i];
        }
        return [best_score, best_move, best_moves];
    }
    // otherwise play as the minimizing player
    else
    {
        // this can be any very positive number
        let best_score = 666;
        for (let i = 0; i < moves.length; i++)
        {
            // make move on the board with the current player
            board_now[moves[i]] = min;

            // recursively find the outcome of the game on that board
            new_score = minimax(board_now, true, depth++)[0];
            if (new_score < best_score)
            {
                best_score = new_score;
                best_move = moves[i];
                best_moves = [moves[i]];
            }
            else if (new_score == best_score)
            {
                best_moves.push(moves[i]);
            }
            // revert board to its previous state (no deep-copy needed)
            board_now[moves[i]] = moves[i];
        }
        return [best_score, best_move, best_moves];
    }

}

// helper function to delay the computer's move a bit so that it looks natural
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// let computer play its move
function computerMove(board, random = false)
{
    let move;
    if (random)
    {
        move = Math.floor(Math.random() * board.length);
    }
    else
    {
        //move = minimax(board, true, 0)[1];
        let moves = minimax(board, true, 0)[2];
        move = moves[Math.floor(Math.random() * moves.length)];
    } 
    let field = document.querySelector(`#${move_ids[move]}`);
    field.classList.add("cross", "fadein");
    board[move] = max;
}

// clean the playing board and also the internal board for next game
async function cleanBoard(wait = false)
{
    let parent = document.querySelector(".grid-container");
    if (wait)
    {
        await sleep(500);
    }
    for (let id = 0; id < move_ids.length; id++)
    {
        parent.querySelector(`#${move_ids[id]}`).classList.remove('circle', 'cross','fadein', 'fadeout');
        board[id] = id;
    }
}
async function animateAndClean(fields, wait = false)
{
    let field;
    let parent = document.querySelector(".grid-container");
    for (let j = 0; j < 3; j++)
    {
        // create the effect of "blinking" the winning sequence
        for (let i = 0; i < fields.length; i++)
        {
            field = parent.querySelector(`#${move_ids[fields[i]]}`);
            field.classList.remove("fadein");
            field.classList.add("fadeout");
        }
        await sleep(200);
        for (let i = 0; i < fields.length; i++)
        {
            field = parent.querySelector(`#${move_ids[fields[i]]}`);
            field.classList.remove("fadeout");
            field.classList.add("fadein");
        }
        await sleep(200);
    }
    cleanBoard();
    
}

// after the game is over, update scores on bottom and prepare the board for a new game
function updateScores()
{
    if (hasWon(board, min)[0])
    {
        game_info["player"]++;
        animateAndClean(hasWon(board, min)[1]);
    }
    else if (hasWon(board, max)[0])
    {
        game_info["computer"]++;
        animateAndClean(hasWon(board, max)[1]);
    }
    else
    {
        game_info["tie"]++;
        cleanBoard(wait = true);
    }
    
    game_info["rounds"]++;
    game_info["started"] = false;

    let info = document.querySelector('.game-info');
    info.querySelector("#wins").innerHTML = `${game_info['player']}`;
    info.querySelector("#ties").innerHTML = `${game_info['tie']}`;
    info.querySelector("#loses").innerHTML = `${game_info['computer']}`;
    
}

document.addEventListener("DOMContentLoaded", function ()
{
    // store the container subtree so that we don't have to look at the entire DOM every time
    let parent = document.querySelector(".grid-container");

    // listen for clicks on the board fields
    for (let id = 0; id < move_ids.length; id++)
    {
        // add an event listener to all fields of the board
        let field = parent.querySelector(`#${move_ids[id]}`);
        field.parentElement.addEventListener("click", async function ()
        {
            // if that field isn't taken yet, claim it
            if (game_info["rounds"] % 2 == 0 && game_info["started"] == false)
            {
                computerMove(board, random = true);
                game_info["started"] = true;
                return;
            }
            let move = move_ids.indexOf(field.getAttribute("id"));
            if (board[move] != min && board[move] != max)
            {
                // turn it into a circle but also add the animation class and make a move on the "internal" board
                field.classList.add('circle', "fadein");
                board[move] = min;

                game_info["started"] = true;

                // check if the player's move made the game end
                if (gameOver(board))
                {
                    updateScores();
                    return;
                }
                await sleep(200);
                // let computer do it's move
                computerMove(board);

                // check if the computer's move made the game end
                if (gameOver(board))
                {
                    updateScores();
                    return;
                }
            }
        }); 
    }
});