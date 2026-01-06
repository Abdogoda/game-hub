// Play sound helper
function playSoundEffect(sound) {
    if (window.playGameSound) {
        window.playGameSound(sound);
    } else if (window.isSoundEnabled && window.isSoundEnabled() && sound) {
        sound.currentTime = 0;
        sound.play().catch(e => console.log('Sound play failed:', e));
    }
}

let title = document.querySelector(".title");
let turn = "X";
let sqaures = [];
function winner(){
    for (let i=1; i<=9; i++){
        sqaures[i] = document.getElementById(`item` + i).innerHTML;
    }
    if(sqaures[1] == sqaures[2] && sqaures[2] == sqaures[3] && sqaures[3] != ''){
        end(1, 2, 3)
    }else if(sqaures[4] == sqaures[5] && sqaures[5] == sqaures[6] && sqaures[6] != ''){
        end(4, 5, 6)
    }else if(sqaures[7] == sqaures[8] && sqaures[8] == sqaures[9] && sqaures[9] != ''){
        end(7, 8, 9)
    }else if(sqaures[1] == sqaures[4] && sqaures[4] == sqaures[7] && sqaures[7] != ''){
        end(1, 4, 7)
    }else if(sqaures[2] == sqaures[5] && sqaures[5] == sqaures[8] && sqaures[8] != ''){
        end(2, 5, 8)
    }else if(sqaures[3] == sqaures[6] && sqaures[6] == sqaures[9] && sqaures[9] != ''){
        end(3, 6, 9)
    }else if(sqaures[1] == sqaures[5] && sqaures[5] == sqaures[9] && sqaures[9] != ''){
        end(1, 5, 9)
    }else if(sqaures[3] == sqaures[5] && sqaures[5] == sqaures[7] && sqaures[7] != ''){
        end(3, 5, 7)
    }else if(sqaures[1] != '' && sqaures[2] != '' && sqaures[3] != '' && sqaures[4] != '' && sqaures[5] != '' && sqaures[6] != '' && sqaures[7] != '' && sqaures[8] != '' && sqaures[9] != ''){
        title.innerHTML = `END GAME`;
        playSoundEffect(document.querySelector(".failed"));
        setInterval(() => {title.innerHTML += "."}, 800);
        setTimeout(() => {window.location.reload();}, 4000);
    }
}
function game(id){
    let ele = document.getElementById(id);
    if (turn === "X" && ele.innerHTML == ''){
        ele.innerHTML = "X";
        turn = "O"
        title.innerHTML = "O Turn"
    }else if(turn === "O" && ele.innerHTML == ''){
        ele.innerHTML = "O";
        turn = "X"
        title.innerHTML = "X turn"
    }
    winner();
}
// 
function end(num1, num2, num3){
    title.innerHTML = `${sqaures[num1]} Winner`;
        document.getElementById(`item`+num1).style.backgroundColor = "#333";
        document.getElementById(`item`+num2).style.backgroundColor = "#333";
        document.getElementById(`item`+num3).style.backgroundColor = "#333";
        playSoundEffect(document.querySelector(".winner"));
        setInterval(() => {title.innerHTML += "."}, 800);
        setTimeout(() => {window.location.reload();}, 3000);
}
