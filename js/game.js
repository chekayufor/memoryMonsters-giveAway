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
var allCards = document.querySelectorAll('.card');
var firstClickOnReview = true;
var reviewTimeInterval;
var checkReviewSecondClickTimeout;



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
var reviewButton = document.querySelector('#review');
var similarButton = document.querySelector('#similar');


function setUserName() {
    console.log('Entered setUserName');
    var storedName = localStorage.getItem('name');  
    console.log('Stored name is: ' + storedName);
    if((storedName !== null) && (storedName !== '')) {
        myHeading.textContent="Lets play, " + storedName + "!";
    } else {
        var myName;
        while ((myName == null) || (myName == '')) {
            myName = prompt('Please enter your name.');
        }
        localStorage.setItem('name', myName);
        myHeading.textContent = "Let's play, " + myName + "!";
        
    }
    myHeading.style.visibility = 'visible'; 
    myButton.textContent = 'Change name';
    startButton.style.visibility = 'visible';
}

window.onload = setUserName;

function changeUserName(){
    var myName = '';
    while (myName == '') {
        myName = prompt('Please enter your name.');
        if (myName == null) return;
    }
    localStorage.setItem('name', myName);
    myHeading.textContent = "Let's play, " + myName + "!";
}

myButton.onclick = function() {
    changeUserName();
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
            document.querySelector('.best-time').innerHTML =  ("Your best time is " + formatMSecToTimeStr(gameTime));
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
    if( (gameOver === false) && (firstClick) ) {                        
        console.log(gameOver + " start to play");
        cardGameField.style.visibility = 'visible'; // first time see the cardGameField 
        startButton.textContent = 'Play Again';     // change the button's name 
        reviewButton.style.visibility = 'visible';  // button review to show ++++++++++
        similarButton.style.visibility = 'visible'
    } else {
        gameOver = false;                          
        console.log(2);
        var flippedCard = document.querySelectorAll('.flipped');
        // Cover all the cards
        for (var i = 0; i < flippedCard.length; ++i) {
            flippedCard[i].classList.remove('flipped');
            // console.log(flippedCard[i]);
        }
        mixCards();
        timeDisplayCaption.innerHTML = ('0:0:0');
        firstClick = true;
        // If the user restarts the game before it is over - stop the game timer 
        if (TOTAL_COUPLES_COUNT > flippedCouplesCount) {
            clearInterval(showGameTimeInterval);
        }    
        flippedCouplesCount = 0;
    }
} 

startButton.onclick = function() {
    startToPlay();
}

// make sure to flip cards if the user did not in 3000 sec

function checkReviewSecondClick(){
    if(firstClickOnReview === false){
        reviewAllCards();
    }
    checkReviewSecondClickTimeout = null;
}

// finding and flipping the similar cards for 2 sec 

function similarCard() {
    var flippedCard = document.querySelectorAll('.flipped');
    var unFlippedCard = document.querySelectorAll('div:not(.flipped)');
    
    var matchedCard = null; 
    
    if (flippedCard.length % 2 === 0){
        console.log('only couples');
        return;
    }else{   
        for(var i = 0; i < unFlippedCard.length; ++i){
            for(var j = 0; j < flippedCard.length; ++j){
                if (unFlippedCard[i].getAttribute('data-card') === flippedCard[j].getAttribute('data-card')){ //сравниваем элементы
                    matchedCard = unFlippedCard[i];  
                    console.log(matchedCard.getAttribute('data-card') + 'is un Flipped match Cards');
                }
            }
        }
    }    
    // Verify that we found the matched card to the single flipped card
    if (matchedCard == null) {
        console.log('ERROR!!! MatchedCard is null!!!');
        return;
    }
    matchedCard.classList.add('flipped');
    setTimeout(function(){
        matchedCard.classList.remove('flipped');
    }, 2000);
}

similarButton.onclick = function() {
    similarCard();
} 

//Review the cards

function reviewAllCards() { 

    // if the button timeout is in effect - cancel it as the user clicked the button himself
    if (checkReviewSecondClickTimeout !== null) {
        clearTimeout(checkReviewSecondClickTimeout);
    }

    // wait for the processing timeout if the user just clicked the second card
    if(isProcessing){
        console.log('Clicked Review while processing ' + isProcessing);
        return;
    }

    if(firstClickOnReview){
        reviewButton.textContent = 'Hide';     // change the button's name          
        var flippedCard = document.querySelectorAll('.flipped');
        // add class revers
        for (var i = 0; i < flippedCard.length; ++i) {
            flippedCard[i].classList.add('revers');
        }
        // Uncover all the cards
        for (var i = 0; i < allCards.length; ++i) {   
            //add class flipped to allCards
            allCards[i].classList.add('flipped');
            // console.log(allCards[i]);
        }
        firstClickOnReview = false;
        checkReviewSecondClickTimeout = setTimeout(checkReviewSecondClick, 3000);  // make sure to flip cards if the user did not in 3000 sec
    } else {
        reviewButton.textContent = 'Review';     // change the button's name  
        var flippedCard = document.querySelectorAll('.flipped');
        var reversCard = document.querySelectorAll('.revers');
        firstClickOnReview = true;
        // Cover all the cards
        for (var i = 0; i < flippedCard.length; ++i) {
            flippedCard[i].classList.remove('flipped');
        }

        for (var i = 0; i < reversCard.length; ++i) {
            reversCard[i].classList.add('flipped');
        }
        for (var i = 0; i < allCards.length; ++i) {   
            allCards[i].classList.remove('revers');
            console.log(allCards[i]);

        }
    }
}  

reviewButton.onclick = function() {
    reviewAllCards();
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

    // If this is the first card, only keep it in the global variable
    if (elPreviousCard === null) {
        elPreviousCard = elCard;
    } else {
        // get the data-card attribute's value from both cards
        var card1 = elPreviousCard.getAttribute('data-card');
        var card2 = elCard.getAttribute('data-card');

        // No match, schedule to flip them back in 1 second
        if (card1 !== card2){
            audioWrong.play();
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