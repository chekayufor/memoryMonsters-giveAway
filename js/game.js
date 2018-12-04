// Those are global variables, they stay alive and reflect the state of the game
var elPreviousCard = null;
var flippedCouplesCount = 0;
var gameOver = false;
var firstClick = true;
var isProcessing = false;
var cardGameField = document.querySelector('#card-game');
var timeDisplayCaption = document.querySelector('#time-display');
var firstCardClickTime;
var showGameTimeInterval;
var gameTime;

// This is a constant that we dont change during the game (we mark those with CAPITAL letters)
var TOTAL_COUPLES_COUNT = 6;
// Load an audio file
var audioWin = new Audio('sound/win.mp3');
var audioWrong = new Audio('sound/wrong.mp3');
var audioRight= new Audio('sound/right.mp3');


// change user name and start the game
var myButton = document.querySelector('.greet-b');
var myHeading = document.querySelector('#greeting h2');
var startButton = document.querySelector('#start');


function setUserName() {
    var myName = prompt('Please enter your name.');
    localStorage.setItem('name', myName);
    myHeading.textContent = "Let's play, " + myName + "!";
    myHeading.style.visibility = 'visible'; 
    myButton.textContent = 'Change name';
    startButton.style.visibility = 'visible';
  }

  var storedName = localStorage.getItem('name');
  if(storedName === null) {
    setUserName();
  } else {
    myHeading.textContent="Lets play, " + storedName + "!";
  }
  myButton.onclick = function() {
    setUserName();
  }

// show the game time to the user
function showGameTime() {
    gameTime = Date.now() - firstCardClickTime;
    timeDisplayCaption.innerHTML = formatMSecToTimeStr(gameTime);
}

// the format function for display time  0:0:0 

function formatMSecToTimeStr(mSec) {
    var hours = Math.floor(mSec / (60 * 60 * 1000));
    var mins = Math.floor(((mSec - (hours * 60 * 60 * 1000)) / (60 * 1000)));
    var secs = Math.floor(((mSec - (hours * 60 * 60 * 1000) - (mins * 60 * 1000)) / 1000)); 
    return (hours + ':' + mins + ':' + secs);
}

//set game time to the local storage
function storeGameTime() {
    localStorage.setItem('gameTime', gameTime);
}

// show Best Time
function showBestTime() {
    var storedGameTime = localStorage.getItem('gameTime');
    if(storedGameTime === null) {
        storeGameTime();
        document.querySelector('.best-time').innerHTML = ("Your best time is " + formatMSecToTimeStr(gameTime));
      } else {
        if(storedGameTime < gameTime) {
            document.querySelector('.best-time').innerHTML =  ("Your best time is " + formatMSecToTimeStr(storedGameTime));
        } else {
            storeGameTime();
            document.querySelector('.best-time').innerHTML =  ("Your best time is " + gameTformatMSecToTimeStr(gameTime));
            alert("Congratulation! New game record!! ");
        }
    }
}

//mix the cards in new game

function mixCards(){
    for(var i = cardGameField.children.length; i >= 0; i-- ){
        cardGameField.appendChild(cardGameField.children[Math.random() * i | 0]);
    }
}

// start/restart to play 
function startToPlay() {
    if(gameOver === false) {                        
       console.log(gameOver + " start to play");
       cardGameField.style.visibility = 'visible'; // first time see the cardGameField 
       startButton.textContent = 'Play Again';     // change the button's name  
    } else {
        gameOver = false;                          
        console.log(2);
        var flippedCard = document.querySelectorAll('.flipped');
        // Cover all the cards
        for (var i = 0; i < flippedCard.length; ++i) {
            flippedCard[i].classList.remove('flipped');
            console.log(flippedCard[i]);
        }
        mixCards();
        timeDisplayCaption.innerHTML = ('0:0:0');
        firstClick = true;
        flippedCouplesCount = 0;
    }
} 
startButton.onclick = function() {
    startToPlay();
}

// This function is called whenever the user click a card
function cardClicked(elCard) {
    
    // Start timer on the first time the user clicks a card
    if (firstClick) {
        firstCardClickTime = Date.now();
        console.log(firstCardClickTime);
        timeDisplayCaption.style.visibility = 'visible';
        showGameTimeInterval = setInterval(showGameTime, 1000);
        firstClick = false;
    }
    
    //if this is a processing of match - do nothing and return from the function
    if(isProcessing){
        console.log('Clicked while processing ' + isProcessing);
        return;
    }

    // If the user clicked an already flipped card - do nothing and return from the function
    if (elCard.classList.contains('flipped')) {
        return;
    }
    // Flip it
    elCard.classList.add('flipped');
    // This is a first card, only keep it in the global variable
    if (elPreviousCard === null) {
        elPreviousCard = elCard;
    } else {
        // get the data-card attribute's value from both cards
        var card1 = elPreviousCard.getAttribute('data-card');
        var card2 = elCard.getAttribute('data-card');

        // No match, schedule to flip them back in 1 second
        if (card1 !== card2){
            setTimeout(function(){
                audioWrong.play();
            }, 100);
            isProcessing = true;
            console.log('this is Processing');
            setTimeout(function(){
                elCard.classList.remove('flipped');
                elPreviousCard.classList.remove('flipped');
                elPreviousCard = null;
                isProcessing = false;
            }, 1000)
             
        } else {
            // Yes! a match!
            audioRight.play();
            flippedCouplesCount++;
            elPreviousCard = null;


            // All cards flipped!
            if (TOTAL_COUPLES_COUNT === flippedCouplesCount) {
                setTimeout(function(){
                    audioWin.play();
                },2000);   
                gameOver = true; 
                console.log(gameOver + "Game is over");
                clearInterval(showGameTimeInterval);
                console.log(gameTime);
                showGameTime(); // shows the actual game time
                showBestTime();
            }

        }

    }

}


