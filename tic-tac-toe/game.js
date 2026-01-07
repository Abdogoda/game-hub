// Translation helper
const t = (key) => {
    return window.i18n ? window.i18n.t(key) : key;
};

// Play sound helper using SoundManager
function playSound(soundName) {
    if (window.SoundManager && window.isSoundEnabled && window.isSoundEnabled()) {
        window.SoundManager.play(soundName);
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
        title.innerHTML = t('ticTacToe.endGame');
        playSound('fail');
        setInterval(() => {title.innerHTML += "."}, 800);
        setTimeout(() => {window.location.reload();}, 4000);
    }
}
function game(id){
    let ele = document.getElementById(id);
    if (turn === "X" && ele.innerHTML == ''){
        ele.innerHTML = "X";
        ele.classList.add('x-player');
        turn = "O"
        title.innerHTML = t('ticTacToe.oTurn');
        playSound('click');
    }else if(turn === "O" && ele.innerHTML == ''){
        ele.innerHTML = "O";
        ele.classList.add('o-player');
        turn = "X"
        title.innerHTML = t('ticTacToe.xTurn');
        playSound('click');
    }
    winner();
}
// 
function end(num1, num2, num3){
    title.innerHTML = `${sqaures[num1]} ${t('ticTacToe.winner')}`;
        document.getElementById(`item`+num1).classList.add('winner');
        document.getElementById(`item`+num2).classList.add('winner');
        document.getElementById(`item`+num3).classList.add('winner');
        playSound('successFanfare');
        setInterval(() => {title.innerHTML += "."}, 800);
        setTimeout(() => {window.location.reload();}, 3000);
}
