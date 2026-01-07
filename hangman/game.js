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

// Letters 
let letters = Array.from("دجحخهعغفقثصضذطكمنتالبيسشئءؤرىةوزظ");
let lettersCon = document.querySelector((".letters"));
letters.forEach(letter => {
    let span = document.createElement("span");
    span.appendChild(document.createTextNode(letter));
    span.className = "letter-box";
    lettersCon.appendChild(span);
})
// 
let words = {
    حيوانات:["اسد", "نمر", "عصفور", "نملة","كلب", "قطة", "نحلة", "ارنب", "ضفدع"],
    ألعاب: ["كرة قدم", "كرة سلة", "بلايستيشن", "كرة طائرة"],
    لاعبون: ["محمد صلاح", "ميسي", "نيمار", "مارادونا", "كريستيانو"],
    بلاد: ["مصر", "فرنسا", "انجلترا", "المغرب", "الصين", "فلسطين"]
}
let allKeys = Object.keys(words);
let randomNum = Math.floor(Math.random() * allKeys.length);
let randomProb = allKeys[randomNum];
let randomProbValues = words[randomProb];
let randomValuesNum = Math.floor(Math.random() * randomProbValues.length);
let randomValuesValue = randomProbValues[randomValuesNum];
// 
document.querySelector(".category span").innerHTML = randomProb;
// 
let letterGuess = document.querySelector(".letters-guess");
let lettersAndSpace = Array.from(randomValuesValue);
lettersAndSpace.forEach(lett => {
    let emptySpan = document.createElement("span");
    if (lett === " "){
        emptySpan.className = "space";
    }
    letterGuess.appendChild(emptySpan);
})
// 
let guessSpanes = document.querySelectorAll(".letters-guess span");
// wrong attempts
let wrontAttempts = 0;
let theDraw = document.querySelector(".hangman-draw");

// Play sound helper
function playSoundEffect(sound) {
    if (window.playGameSound) {
        window.playGameSound(sound);
    } else if (window.isSoundEnabled && window.isSoundEnabled() && sound) {
        sound.currentTime = 0;
        sound.play().catch(e => console.log('Sound play failed:', e));
    }
}

// 

document.addEventListener("click", (e) => {
    let thestatus = false;
    if (e.target.className === "letter-box"){
        e.target.classList.add("clicked");
        
        // Play click sound
        playSound('click');
        
        lettersAndSpace.forEach((wordLetter, wordIndex) => {
            if (e.target.innerHTML == wordLetter){
                thestatus = true;
                guessSpanes.forEach((span, spanIndex) => {
                    if (wordIndex == spanIndex){
                        span.innerHTML = e.target.innerHTML;
                        // 
                        let yu = true;
                        for(let i=0; i<guessSpanes.length; i++){
                            if(guessSpanes[i].innerHTML == '' && guessSpanes[i].className != "space"){
                                yu = false;
                            }
                        }
                        if(yu === true){
                            successGame();
                        }
                    }
                });
            }
        });
        if (thestatus != true){
            wrontAttempts++;
            theDraw.classList.add(`wrong-${wrontAttempts}`);
            
            // Play wrong sound
            playSound('wrong');
            
            if (wrontAttempts == 6){
                playSound('buzzer');
                setTimeout(() => {
                    lettersCon.classList.add("finish");
                failGame();
                }, 2000);
                
            }
        }
    }
})
function failGame(){
    let div = document.createElement("div");
    let divText = document.createTextNode(`${t('hangman.gameOver')} ${randomValuesValue}`);
    div.appendChild(divText);
    div.className = "endGame";
    document.querySelector(".container").appendChild(div);
    setTimeout(() => {
        window.location.reload();
    }, 4000);
}

function successGame(){
    playSound('successFanfare');
    let div = document.createElement("div");
    let divText = document.createTextNode(t('hangman.youWin'));
    div.appendChild(divText);
    div.className = "endGame";
    document.querySelector(".container").appendChild(div);
    setTimeout(() => {
        window.location.reload();
    }, 4000);
}





