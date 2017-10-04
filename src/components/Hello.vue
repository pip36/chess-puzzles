<template>
  <div class="hello">
    <h1>{{ activePuzzle.players }} {{ activePuzzle.date }}</h1>
    <button @click="loadPuzzle()"> New Puzzle </button>
    <button @click="revealSolution()"> I give up </button>
    <h2 v-if="!solved && !hasMoved && !solutionVisible"> {{ currentColor }} to move... </h2>
    <h2 v-if="solved"> &#9786; You Got It! </h2>
    <h2 v-if="!solved && hasMoved"> &#9785; Nope that's not it <button @click="reloadPuzzle()"> retry? </button> </h2>
    <h2 v-show="solutionVisible"> {{ activePuzzle.solution }} </h2>
    <div id='chess' @click="getPuzzleAttempt()"> </div>
  </div>
</template>

<script>

import Firebase from 'firebase'
  // Initialize Firebase
  let config = {
    apiKey: "AIzaSyAAPWD140Fe0jWTja8JvkU89_oTmm481RE",
   authDomain: "chess-puzzles-52133.firebaseapp.com",
   databaseURL: "https://chess-puzzles-52133.firebaseio.com",
   projectId: "chess-puzzles-52133",
   storageBucket: "chess-puzzles-52133.appspot.com",
   messagingSenderId: "718871200326"
  };
  let app = Firebase.initializeApp(config);
  let db = app.database();
  let puzzlesRef = db.ref('puzzles');

export default {
  name: 'hello',
  data () {
    return {
      msg: 'Welcome to Your Vue.js App',
      puzzles: puzzlesRef,
      activePuzzle: {},
      solutionVisible: false,
      gaveUp: false,
      hasMoved: false,
      solutionAttempt: "",
      solved: false,
      currentColor: "white",
      chess: {}
    }
  },
  methods: {
    initChessBoard() {
      var chess = new Chess();
      this.chess = chess;
      chess.setup();
    },
    loadPuzzle() {
      var self = this;
      this.reset();
      this.solutionVisible = false;
      return this.puzzles.once('value').then(function(snapshot){
        var puzzleArray = snapshot.val();
        var randomIndex = Math.floor(Math.random()*puzzleArray.length);
        var newPuzzle = puzzleArray[randomIndex];
        self.activePuzzle = newPuzzle;
        self.chess.setPosition(newPuzzle.fen);
        self.currentColor = self.chess.getCurrentPlayer();
      });
    },
    reloadPuzzle() {
      this.reset();
      this.chess.setPosition(this.activePuzzle.fen);
    },
    revealSolution() {
      this.gaveUp = true;
      this.solutionVisible = true;
      var sanstring = this.activePuzzle.solution.replace(/\./g, '').split(' ')[0];
      this.chess.moveSAN(sanstring);
    },
    getPuzzleAttempt() {
      if(this.hasMoved == false && this.gaveUp == false && this.chess.getLastMove().length > 1){
        this.hasMoved = true;
        this.solutionAttempt = this.chess.getLastMove().split(' ')[2];
        if(this.solutionAttempt == this.activePuzzle.solution.replace(/\./g, '').split(' ')[0]){
          this.solved = true;
        };
      }
    },
    reset(){
      this.hasMoved = false;
      this.solutionAttempt = "";
      this.solved = false;
      this.gaveUp = false;
      this.chess.clearMoves();
      this.chess.clearView();
    }
  },
  mounted(){
      this.initChessBoard();
      this.loadPuzzle();
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style >
h2{
  font-size: 20px;
}

table{
  border-spacing: 0;
  margin-left: auto;
  margin-right: auto;
}

#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 20px;
}

#chess{
	width:100%;
	height:600px;
	font-size: 35px;
  color: black;
  margin-top:5px;
}


tr:nth-child(odd) td:nth-child(odd){
  background-color: #d4e1f7;
}
tr:nth-child(even) td:nth-child(even){
  background-color: #d4e1f7;
}

ul{
	list-style: none;
}

.moves-list{
	font-size: 0px;
}

td{
	width: 45px;
	height:45px;
}

.selected{
	//background-color: #d4edce !important;
}
.active{
	background-color: blue !important;
}
.attacker{
	//background-color: purple !important;
}
.castle{
	background-color: orange !important;
}

.moves-list{
//	height:300px;
//	width:400px;
//	border: 1px solid black;
//	margin-top: 20px;
}

</style>
