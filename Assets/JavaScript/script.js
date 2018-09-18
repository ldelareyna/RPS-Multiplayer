  // Initialize Firebase
  var config = {
    apiKey: "AIzaSyB3RWslosbF8s_aftuXatzCKVOuxhfW110",
    authDomain: "rps-multiplayer-game-c656f.firebaseapp.com",
    databaseURL: "https://rps-multiplayer-game-c656f.firebaseio.com",
    projectId: "rps-multiplayer-game-c656f",
    storageBucket: "",
    messagingSenderId: "770330877561"
  };
  firebase.initializeApp(config);
  
  var database = firebase.database();
  
  // PLAYERS IN THE DATABASE
  var playerTurn = database.ref();
  var players = database.ref("/players");
  var player1 = database.ref("/players/player1");
  var player2 = database.ref("/players/player2");
  var playerChat = database.ref("/chat");

  // INITIALIZE ALL GLOBAL VARIABLES
  var player;
  var p1snapshot;
  var p2snapshot;
  var p1result;
  var p2result;
  var p1 = null;
  var p2 = null;
  var wins1 = 0;
  var wins2 = 0;
  var losses1 = 0;
  var losses2 = 0;
  var playerNum = 0;
  
  //SUBMIT FORM: ENTER PLAYER
  $("#playerInfo").html("<input id=playerName type=text placeholder='Enter your name to begin'><input id=enterPlayer type=submit value=Start>");
  
  
  
  //PUBLISH CHANGE TO PLAYER 1 DATABASE
  player1.on("value", function(snapshot) {
      if (snapshot.val() !== null) {
          p1 = snapshot.val().player;
          wins1 = snapshot.val().wins;
          losses1 = snapshot.val().losses;
          $("#p1name").html("<h2>" + p1 + "</h2>");
          $("#p1stats").html("<p>Wins: " + wins1 + "  Losses: " + losses1 + "</p>");
      } else {
          $("#p1name").html("Waiting for Player 1");
          $("#p1stats").empty();
          //DISPLAY: PLAYER DISCONNECTED 
          if (p1 !== null) {
              playerChat.push({
                  player: p1,
                  taunt: " has disconnected",
                  dateAdded: firebase.database.ServerValue.TIMESTAMP
              });
          };
      };
  }, function(errorObject) {
      console.log("The read failed: " + errorObject.code);
  });
  
  //PUBLISH CHANGE TO PLAYER 2 DATABASE
  player2.on("value", function(snapshot) {
      if (snapshot.val() !== null) {
          p2 = snapshot.val().player;
          wins2 = snapshot.val().wins;
          losses = snapshot.val().losses;
          $("#p2name").html("<h2>" + p2 + "</h2>");
          $("#p2stats").html("<p>Wins: " + wins2 + "  Losses: " + losses2 + "</p>");
      } else {
          $("#p2name").html("Waiting for Player 2");
          $("#p2stats").empty();
          
          if (p2 !== null) {
              playerChat.push({
                  player: p2,
                  taunt: " has disconnected",
                  dateAdded: firebase.database.ServerValue.TIMESTAMP
              });
          };
      };
  }, function(errorObject) {
      console.log("The read failed: " + errorObject.code);
  });
  
  // On Submit button, added player depending on who is already in the firebase database by checking if exists
  $("#enterPlayer").on("click", function() {
      event.preventDefault();
      player = $("#playerName").val().trim();
      player1.once("value", function(snapshot) {
          p1snapshot = snapshot;
      }, function(errorObject) {
          console.log("The read failed: " + errorObject.code);
      });
      player2.once("value", function(snapshot) {
          p2snapshot = snapshot;
      }, function(errorObject) {
          console.log("The read failed: " + errorObject.code);
      });
      //IF NO PLAYER ONE
      if (!p1snapshot.exists()) {
          //SET TO KNOW WHICH PAGE TO DISPLAY
          playerNum = 1;
          //IF PLAER DISCONNECTS: REMOVE FORM DATABASE
          player1.onDisconnect().remove();
          //SET PLAYER 1
          player1.set({
              player: player,
              wins: 0,
              losses: 0
          });
          $("#playerInfo").html("Hi " + player + "! You are Player 1");
          //IF NOT PLAYER TWO
          if (!p2snapshot.exists()) {
              $("#playerTurn").html("Waiting for Player 2 to join...");
          };
      //IF NOT PLAYER 2
      } else if (!p2snapshot.exists()) {
          //SET TO KNOW WHICH PAGE TO DISPLAY
          playerNum = 2;
          //IF PLAYER DICONNECTS: REMOVE FORM DATABASE
          player2.onDisconnect().remove();
          //SET PLAYER 2
          player2.set({
              player: player,
              wins: 0,
              losses: 0
          });
          //STARTS GAME
          playerTurn.update({
              turn: 1
          });
          $("#playerInfo").html("Hi " + player + "! You are Player 2");
          $("#playerTurn").html("Waiting for " + p1 + " to choose.");
      //IF THERE ARE 2 PLAYERS;NO THIRD
      } else {
          $("#playerInfo").html("Sorry. Two people are already playing");
      };
  });
  
  players.on("value", function(snapshot) {
      //IF BOTH PLAYER LEAVE, RESET: DELETE FROM DATABASE
      if (snapshot.val() == null) {
          $("#player1").css("border-color", "black");
          $("#player2").css("border-color", "black");
          playerTurn.set({});
      };
  }, function(errorObject) {
      console.log("The read failed: " + errorObject.code);
  });
  
  
  //RESULTS
  var rpsResults = function() {
      //FUNCTION CALLED: GET PLAYERS DATA
      player1.once("value", function(snapshot) {
          p1result = snapshot;
      }, function(errorObject) {
          console.log("The read failed: " + errorObject.code);
      });
      player2.once("value", function(snapshot) {
          p2result = snapshot;
      }, function(errorObject) {
          console.log("The read failed: " + errorObject.code);
      });
      //LOGIC FOR RESULT
      if (p1result.val() !== null && p2result.val() !== null) {
          //TIE
          if (p1result.val().choice == p2result.val().choice) {
              $("#p1choices").html("<h1>" + p1result.val().choice + "</h1>");
              $("#p2choices").html("<h1>" + p2result.val().choice + "</h1>");
              $("#results").html("<br><br><h1>Tie Game!</h1>");
          //PLAYER 1 WINS
          } else if (p1result.val().choice == "Rock" && p2result.val().choice == "Scissors") {
              $("#p1choices").html("<h1>" + p1result.val().choice + "</h1>");
              $("#p2choices").html("<h1>" + p2result.val().choice + "</h1>");
              $("#results").html("<h1>" + p1 + " wins!</h1>");
              wins1++;
              losses2++;
          //PLAYER 2 WINS
          } else if (p1result.val().choice == "Rock" && p2result.val().choice == "Paper") {
              $("#p1choices").html("<h1>" + p1result.val().choice + "</h1>");
              $("#p2choices").html("<h1>" + p2result.val().choice + "</h1>");
              $("#results").html("<h1>" + p2 + " wins!</h1>");
              wins2++;
              losses1++;
          //PLAYER 2 WINS
          } else if (p1result.val().choice == "Paper" && p2result.val().choice == "Scissors") {
              $("#p1choices").html("<h1>" + p1result.val().choice + "</h1>");
              $("#p2choices").html("<h1>" + p2result.val().choice + "</h1>");
              $("#results").html("<h1>" + p2 + " wins!</h1>");
              wins2++;
              losses1++;
          //PLAYER 1 WINS
          } else if (p1result.val().choice == "Paper" && p2result.val().choice == "Rock") {
              $("#p1choices").html("<h1>" + p1result.val().choice + "</h1>");
              $("#p2choices").html("<h1>" + p2result.val().choice + "</h1>");
              $("#results").html("<h1>" + p1 + " wins!</h1>");
              wins1++;
              losses2++;
          //PLAYER 1 WINS
          } else if (p1result.val().choice == "Scissors" && p2result.val().choice == "Paper") {
              $("#p1choices").html("<h1>" + p1result.val().choice + "</h1>");
              $("#p2choices").html("<h1>" + p2result.val().choice + "</h1>");
              $("#results").html("<h1>" + p1 + " wins!</h1>");
              wins1++;
              losses2++;
          //PLAYER 2 WINS
          } else if (p1result.val().choice == "Scissors" && p2result.val().choice == "Rock") {
              $("#p1choices").html("<h1>" + p1result.val().choice + "</h1>");
              $("#p2choices").html("<h1>" + p2result.val().choice + "</h1>");
              $("#results").html("<h1>" + p2 + " wins!</h1>");
              wins2++;
              losses1++;
          };
          //RESET
          setTimeout(function() {
              playerTurn.update({
                  turn: 1
              });
              player1.once("value", function(snapshot) {
                  p1result = snapshot;
              }, function(errorObject) {
                  console.log("The read failed: " + errorObject.code);
              });
              if (p1result.val() !== null) {
                  player1.update({
                      wins: wins1,
                      losses: losses1
                  });
              };
              player2.once("value", function(snapshot) {
                  p2result = snapshot;
              }, function(errorObject) {
                  console.log("The read failed: " + errorObject.code);
              });
              if (p2result.val() !== null) {
                  player2.update({
                      wins: wins2,
                      losses: losses2
                  });
              };
              $("#results").html("");
              $("#p2choices").html("");
              $("#player2").css("border-color", "black");
              }, 1000*4);
      };
  };
  
  //WHO'S TURN IT IS
  playerTurn.on("value", function(snapshot) {
      if (snapshot.val() !== null) {
          //HIGHLIGHT BOX OF WHO'S TURN IT IS
          if (snapshot.val().turn == 1) {
              $("#player1").css("border-color", "green");
          } else if (snapshot.val().turn == 2) {
              $("#player2").css("border-color", "green");
              $("#player1").css("border-color", "black");
          }
          //WAITING FOR OTHER PLAYER
          if (snapshot.val().turn == 2 && playerNum == 1) {
              $("#playerTurn").html("Waiting for " + p2 + " to choose.");
          } else if (snapshot.val().turn == 1 && playerNum == 2) {
              $("#p1choices").html("");
              $("#playerTurn").html("Waiting for " + p1 + " to choose.");
          }
          //PLAYER 1'S TURN
          if (snapshot.val().turn == 1 && playerNum == 1) {
              $("#p1choices").empty();
              $("#p1choices").append("<div>Rock</div>");
              $("#p1choices").append("<div>Paper</div>");
              $("#p1choices").append("<div>Scissors</div>");
              $("#playerTurn").html("It's your turn!");
          //PLAYER 2'S TURN
          } else if (snapshot.val().turn == 2 && playerNum == 2) {
              $("#p2choices").empty();
              $("#p2choices").append("<div>Rock</div>");
              $("#p2choices").append("<div>Paper</div>");
              $("#p2choices").append("<div>Scissors</div>");
              $("#playerTurn").html("It's your turn!");
          //CALL RESULT
          } else if (snapshot.val().turn == 3) {
              $("#playerTurn").html("");
              rpsResults();
          };
      };
  });
  
  //DISPLAY'S PLAYERS CHOICE
  $("#p1choices").on("click", "div", function() {
      var choice = $(this).text();
      $("#p1choices").html("<br><br><br><h1>" + choice + "</h1>");
      setTimeout(function() {
          playerTurn.update({
              turn: 2
          });
          player1.update({
              choice: choice
          }); 
      }, 500);
  });
  $("#p2choices").on("click", "div", function() {
      var choice = $(this).text();
      $("#p2choices").html("<br><br><br><h1>" + choice + "</h1>");
      setTimeout(function() {
          player2.update({
              choice: choice
          }); 
          playerTurn.update({
              turn: 3
          });
      }, 500);
  });
  
  //MESSEGES
  $("#taunt").on("click", function() {
      event.preventDefault();
      var message = $("#messageBox").val().trim();
      $("#messageBox").val("");
      if (playerNum == 1) {
          playerChat.push({
              player: p1 + ": ",
              taunt: message,
              dateAdded: firebase.database.ServerValue.TIMESTAMP
          });
      } else if (playerNum == 2) {
          playerChat.push({
              player: p2 + ": ",
              taunt: message,
              dateAdded: firebase.database.ServerValue.TIMESTAMP
          });
      };
  });
  
  //ADD MESSAGE: SCROLLED DOWN TO RECENT MESSAGE
  playerChat.orderByChild("dateAdded").on("child_added", function(snapshot) {
      $("#chatbox").append(snapshot.val().player + snapshot.val().taunt + "<br>");
      var bottom = $("#chatbox").get(0);
      bottom.scrollTop = bottom.scrollHeight;
  });