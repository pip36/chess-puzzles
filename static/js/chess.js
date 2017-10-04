function Chess(){

	//The unicode characters for each chess piece
	var CHESS_CHARACTERS = {
		"P": "&#9817;",
		"p": "&#9823;",
		"R": "&#9814;",
		"r": "&#9820;",
		"N": "&#9816;",
		"n": "&#9822;",
		"B": "&#9815;",
		"b": "&#9821;",
		"Q": "&#9813;",
		"q": "&#9819;",
		"K": "&#9812;",
		"k": "&#9818;",
		"0": " "
	}

	//directional movement of pieces stored as vectors
	var CROSS_MOVES = [[1,0],[0,1],[-1,0],[0,-1]];
	var DIAGONAL_MOVES = [[1,1],[-1,-1],[1,-1],[-1,1]];
	var KNIGHT_MOVES = [[2,1],[2,-1],[-2,1],[-2,-1],[1,2],[1,-2],[-1,2],[-1,-2]];
	var PAWN_MOVES_BLACK = [[1,0],[2,0],[1,-1],[1,1]];
	var PAWN_MOVES_WHITE = [[-1,0],[-2,0],[-1,-1],[-1,1]];

	//************************************************************************//
	//*******************Private Helper Functions*****************************//
	//************************************************************************//
	//returns true if a given coordinate is within the bounds of the board
	var isOnBoard = function(coordinate){
		if(coordinate[0] >= 0 && coordinate[0] < 8 && coordinate[1] >= 0 && coordinate[1] < 8){
			return true;
		}
		else{ return false };
	}

	//Check if the content of a square matches the current player
	var isOwnPiece = function(content){
		if((content == content.toUpperCase() && game.currentPlayer == 1) ||
			(content != content.toUpperCase() && game.currentPlayer == -1)){
			return true;
		}
		else{ return false; }
	}

	// sets up a table object functioning as the chessboard, and a moves list below it to store algebraic notation
	var setUpBoard = function(){
		$('#chess').append("<table></table>");
		for(var i = 0; i < 8; i++){
			$('#chess table').append("<tr id='" + (8-i) + "'></tr>");
		}
		$('#chess table tr').each(function(index){
			for(var i = 0; i < 8; i++){
				$(this).append("<td></td>")
			}
	    });
	    $('#chess').append(" </ul> <button id='previous'> < </button> <button id='next'> > </button> <ul class='moves-list'>");
	    $('.moves-list').append("<li> </li>");
	    $('tr:nth-child(even) td:nth-child(odd)').css("background-color", "#6a8dcc");
	   	$('tr:nth-child(odd) td:nth-child(even)').css("background-color", "#6a8dcc");
	}

	// This takes an FEN formatted string and converts it to a 2d array of characters representing a chessboard
	var FENtoBoardData = function(FENstring){
		var result = [];
		var rows = FENstring.split("/");
		for(var i = 0; i < 8; i++){
			var rowString = rows[i];
			var Output = "";
			//iterates over the string for each row, converting any numbers into '0' representing a blank square
			for(var j = 0; j < rowString.length; j++){
				if(isNaN(rowString.charAt(j)) == false){
					for(var n = 0; n<parseInt(rowString.charAt(j)); n++){ Output += "0";}
				}
				else{ Output += rowString.charAt(j);}
			}
			result.push(Output.split(""));
		}
		return result;
	}

	//function will render a chessposition onto the board from a 2D array, using Unicode Characters defined at top
	var renderBoard = function(boardData){
		for(var x = 0; x < 8; x++){
			for(var y = 0; y < 8; y++){
				$('#' + (8-x) + " td").eq(y).html(CHESS_CHARACTERS[boardData[x][y]]);
			}
		}
	}

	//get all available moves for a given piece(returned as an array [x,y], regardless if it is valid or not
	//checkALL will return all squares that could possibly attack the given square
	var getPseudoMoves = function(boardData, x, y, checkAll = false){
		var result = [];
		var board = boardData;

		// this function makes a path of coordinates from a given direction until it reaches the edge of the board
		var checkPath = function(moveArr, x, y, path){
			//if piece paths over multiple squares (BISHOP,QUEEN,ROOK)
			if(path){
				for(var i = 0; i < moveArr.length; i++){
					var path = []
					var currentX = x, currentY = y;
					var newPosition = [currentX + moveArr[i][0], currentY + moveArr[i][1]];
					while(isOnBoard(newPosition)){
						path.push(newPosition);
						currentX += moveArr[i][0];
						currentY += moveArr[i][1];
						newPosition = [currentX + moveArr[i][0], currentY + moveArr[i][1]];
					}
					result.push(path);
				}
			}
			// for pieces that dont path, just add each of its moves as a possibility
			else{
				for(var i = 0; i < moveArr.length; i++){
					newPosition = [x + moveArr[i][0], y + moveArr[i][1]];
					result.push([newPosition]);
				}
			}
		}

		//Will return all squares that could possibly attack the given square
		if(checkAll == true){
			checkPath(CROSS_MOVES, x, y, true);
			checkPath(DIAGONAL_MOVES,x,y, true);
			checkPath(KNIGHT_MOVES,x,y, false);
			checkPath(PAWN_MOVES_BLACK,x,y, false);
			checkPath(PAWN_MOVES_WHITE,x,y, false);
			return result;
		}

		//ROOK and QUEEN
		if(board[x][y] == "r" || board[x][y] == "R" || board[x][y] == "q" || board[x][y] == "Q"){
			checkPath(CROSS_MOVES, x, y, true);
		}
		//BISHOP and QUEEN
		if(board[x][y] == "b" || board[x][y] == "B" || board[x][y] == "q" || board[x][y] == "Q"){
			checkPath(DIAGONAL_MOVES,x,y, true);
		}
		//KNIGHT
		if(board[x][y] == "n" || board[x][y] == "N"){
			checkPath(KNIGHT_MOVES,x,y, false);
		}
		//KING (pathing turned to false, to get only single move in a direction)
		if(board[x][y] == "k" || board[x][y] == "K"){
			checkPath(CROSS_MOVES,x,y, false);
			checkPath(DIAGONAL_MOVES,x,y, false);
		}
		//BLACK PAWN (returns all moves including capture moves)
		if(board[x][y] == "p"){
			checkPath(PAWN_MOVES_BLACK,x,y, false);
		}
		//WHITE PAWN
		if(board[x][y] == "P"){
			checkPath(PAWN_MOVES_WHITE,x,y, false);
		}
		return result;
	}

	//takes a list of possible moves, and returns only the moves that are considered valid according to the board position

	var validateMovesList = function(boardData, movePaths, pieceType, currentSquare){
		var result = [];
		var b = boardData;
		//PAWN VALIDATION (requires extra validation for capture moves, double moves)
		if(pieceType == "p" || pieceType == "P"){
			for(var i = 0; i < movePaths.length; i++){
				for(var j = 0; j < movePaths[i].length; j++){
					var position = movePaths[i][j];
					//if currently checking the double move (makes assumption that the PAWN_MOVES index wont change, not great... explicit check safer)
					if(i == 1){
						if(game.currentPlayer == -1){
							//dont allow double move when on the wrong rank
							if(position[0] != 3){
								continue;
							}
							//dont allow the double move if the square directly in front is occupied
							else if(boardData[movePaths[i-1][j][0]][movePaths[i-1][j][1]] != "0"){
								continue;
							}
						}
						else if(game.currentPlayer == 1){
							if(position[0] != 4){
								continue;
							}
							else if(boardData[movePaths[i-1][j][0]][movePaths[i-1][j][1]] != "0"){
								continue;
							}
						}
					}

					if(isOnBoard(position)){
						var destinationContents = boardData[position[0]][position[1]];
						//Allow the pawn to move to empty squares, if it is moving vertically
						if(destinationContents == "0"){
							//is vertical
							if(!(i > 1)){ //again relying on index of PAWN_MOVES being constant -- explicit check for vertical move would be better
								result.push(position);
							}
							//is diagonal
							else{
								//validate diagonal move to an empty square ONLY if it is an enpassant capture
								if(game.enPassantSquare != null && (game.enPassantSquare[0] == position[0] && game.enPassantSquare[1] == position[1])){
									result.push(game.enPassantSquare);
								}
							}
						}
						//Allow diagonal moves where it will capture an enemy piece
						else{
							if((i > 1)){
							 	if(isOwnPiece(destinationContents) == false){
							 		result.push(position);
							 	}

							}
						}
					}
				}
			}
		}
		// STANDARD VALIDATION (if the piece is not a pawn)
		else{
			//iterates over each move path, blocking moves where it meets a friendly piece
			//allows moves to empty squares or captures only
			for(var i = 0; i < movePaths.length; i++){
				for(var j = 0; j < movePaths[i].length; j++){
					var position = movePaths[i][j];
					if(isOnBoard(position)){
						var destinationContents = b[position[0]][position[1]];
						if(destinationContents != "0"){
							if(isOwnPiece(destinationContents)){
									break;
								}
							else{
								result.push(position);
				  	 			break;
							}
						}
						else{
							result.push(position);
						}
					}
				}
			}
		}
		//Removes any moves that would put friendly king in check
		for(var i = 0; i < result.length; i++){
			//create copy of future board and assess it for check (is the king attacked)
			var newBoardState = JSON.parse(JSON.stringify(game.currentBoardState));
			newBoardState[result[i][0]][result[i][1]] = newBoardState[currentSquare[0]][currentSquare[1]];
			newBoardState[currentSquare[0]][currentSquare[1]] = "0";
			var kingPosition = getKingPosition(newBoardState, game.currentPlayer);
		    if(isCellAttacked(newBoardState, kingPosition[0], kingPosition[1])){
				result.splice(i,1);
				i--;
			}
		}
		return result;
	}

	//is given cell attacked or not
	var isCellAttacked = function(boardData, x, y){
		//check if a cell is attacked along a specific move path
		var findAttackers = function(boardData, moveArr, x, y, attackerArr, path){
			//if piece paths over multiple squares (BISHOP,QUEEN,ROOK)
			if(path){
				for(var i = 0; i < moveArr.length; i++){
					var currentX = x, currentY = y;
					var newPosition = [currentX + moveArr[i][0], currentY + moveArr[i][1]];
					while(isOnBoard(newPosition)){

						var destinationContents = boardData[newPosition[0]][newPosition[1]];

						if(destinationContents != "0"){
							if(isOwnPiece(destinationContents)){
								break;
							}
							else{
								for(var p = 0; p < attackerArr.length; p++){
									if(destinationContents.toUpperCase() == attackerArr[p]){
										$('#' + (8-newPosition[0]) + " td").eq(newPosition[1]).addClass("attacker");
										return true;
									}
								}
								break;
							}
						}
						currentX += moveArr[i][0];
						currentY += moveArr[i][1];
						newPosition = [currentX + moveArr[i][0], currentY + moveArr[i][1]];
					}
				}
			}
			else{
				for(var i = 0; i < moveArr.length; i++){
					var currentPosition = boardData[x][y];
					var currentX = x, currentY = y;
					var newPosition = [currentX + moveArr[i][0], currentY + moveArr[i][1]];
					if(isOnBoard(newPosition)){
						var destinationContents = boardData[newPosition[0]][newPosition[1]];
						if(destinationContents != "0"){
							if((destinationContents == destinationContents.toUpperCase() && game.currentPlayer == -1) ||
							(destinationContents != destinationContents.toUpperCase() && game.currentPlayer == 1)){ //if piece is different color
								for(var p = 0; p < attackerArr.length; p++){
									if(destinationContents.toUpperCase() == attackerArr[p]){

										$('#' + (8-newPosition[0]) + " td").eq(newPosition[1]).addClass("attacker");
										return true;
									}
								}
							}
						}
					}
				}
			}
			return false;
		}
		//check each path for attackers
		if((findAttackers(boardData, CROSS_MOVES, x, y, ["R","Q"], true)) ||
			(findAttackers(boardData, DIAGONAL_MOVES, x, y, ["B","Q"], true)) ||
			(findAttackers(boardData, KNIGHT_MOVES, x, y, ["N"], false))||
			(findAttackers(boardData, CROSS_MOVES, x, y, ["K"], false))||
			(findAttackers(boardData, DIAGONAL_MOVES, x, y, ["K"], false))){
			return true;
		}


		//****** REFACTOR *******//
		//special case for pawns
		if(game.currentPlayer == 1){
			var currentPosition = boardData[x][y];
			var currentX = x, currentY = y;
			var testPosition = [currentX - 1, currentY - 1];
			if(isOnBoard(testPosition)){
				var destinationContents = boardData[testPosition[0]][testPosition[1]];
				if (destinationContents == "p"){
					$('#' + (8-testPosition[0]) + " td").eq(testPosition[1]).addClass("attacker");
					return true;
				}
			}
			var testPosition = [currentX - 1, currentY + 1];
			if(isOnBoard(testPosition)){
				var destinationContents = boardData[testPosition[0]][testPosition[1]];
				if(destinationContents == "p"){
					$('#' + (8-testPosition[0]) + " td").eq(testPosition[1]).addClass("attacker");
					return true;
				}
			}
		}
		// ^^almost identical merge into function
	    if(game.currentPlayer == -1){
			var currentPosition = boardData[x][y];
			var currentX = x, currentY = y;
			var testPosition = [currentX + 1, currentY - 1];

			if(isOnBoard(testPosition)){
				var destinationContents = boardData[testPosition[0]][testPosition[1]];
				if (destinationContents == "P"){
					$('#' + (8-testPosition[0]) + " td").eq(testPosition[1]).addClass("attacker");
					return true;
				}
			}
			var testPosition = [currentX + 1, currentY + 1];

			if(isOnBoard(testPosition)){
				var destinationContents = boardData[testPosition[0]][testPosition[1]];
				if(destinationContents == "P"){
					$('#' + (8-testPosition[0]) + " td").eq(testPosition[1]).addClass("attacker");
					return true;
				}
			}

		}
		return false;
	}

	//takes an array of moves and marks them on board as an available move
	var renderMoves = function(movesArr){
		for(var i = 0; i < movesArr.length; i++){
			$('#' + (8-movesArr[i][0]) + " td").eq(movesArr[i][1]).addClass("selected");
		}
	}
	//clear any extra visual elements on the board
	var clearOverlay = function(){
		$('td').removeClass('selected active attacker castle');
	}

	//checks if the current player is able to castle AND adds visual AND adds as a valid move
	// *** code repetition tidy up ***//
	var canCastle = function(boardData){
		if(game.currentPlayer == 1){
			if(game.whiteCastleKing){
				if(boardData[7][5] == "0" && boardData[7][6] == "0"
				&& isCellAttacked(boardData,7,5) == false && isCellAttacked(boardData,7,6) == false && isCellAttacked(boardData,7,4) == false){
					$("#1 td").eq(6).addClass("castle");
					game.currentValidMoves.push([7,6]);
				}
			}
			if(game.whiteCastleQueen){
				if(boardData[7][1] == "0" && boardData[7][2] == "0" && boardData[7][3] == "0"
				&& isCellAttacked(boardData,7,1) == false && isCellAttacked(boardData,7,2) == false && isCellAttacked(boardData,7,3) == false
				&& isCellAttacked(boardData,7,4) == false){
					$("#1 td").eq(2).addClass("castle");
					game.currentValidMoves.push([7,2]);
				}
			}
		}
		if(game.currentPlayer == -1){
			if(game.blackCastleKing){
				if(boardData[0][5] == "0" && boardData[0][6] == "0"
				&& isCellAttacked(boardData,0,5) == false && isCellAttacked(boardData,0,6) == false && isCellAttacked(boardData,0,4) == false){
					$("#8 td").eq(6).addClass("castle");
					game.currentValidMoves.push([0,6]);
				}
			}
			if(game.blackCastleQueen){
				if(boardData[0][1] == "0" && boardData[0][2] == "0" && boardData[0][3] == "0"
				&& isCellAttacked(boardData,0,1) == false && isCellAttacked(boardData,0,2) == false && isCellAttacked(boardData,0,3) == false
				&& isCellAttacked(boardData,0,4) == false){
					$("#8 td").eq(2).addClass("castle");
					game.currentValidMoves.push([0,2]);
				}
			}
		}
	}

	//Get the king position of a specified player
	var getKingPosition = function(boardData, player){
		for(var x = 0; x < 8; x++){
			for(var y = 0; y < 8; y++){
				if(boardData[x][y] == "k" && player == -1){
					return [x,y];
				}
				else if(boardData[x][y] == "K" && player == 1){
					return[x,y];
				}
			}
		}
	}

	//checks if there are any valid moves for the current player on the board
	var NoValidMoves = function(boardData){
		for(var x = 0; x < 8; x++){
			for(var y = 0; y < 8; y++){
				var content = game.currentBoardState[x][y];
				var currentSquare = [x,y];
				//if clicking on a square show any available moves
				if((content == content.toUpperCase() && game.currentPlayer == 1) || (content != content.toUpperCase() && game.currentPlayer == -1)){
					var validMoves = validateMovesList(game.currentBoardState, getPseudoMoves(game.currentBoardState,x,y), content, currentSquare);
					if(validMoves.length > 0){
						return false;
					}
				}
			}
		}
		return true;
	}

//convert coordinate array to algebraic notation eg [0,0] => "A8" {top-left of board 0 indexed}
	var arrToAlgebraic = function(arr){
		var char = String.fromCharCode(97 + arr[1]);
		return char + (8-arr[0]).toString()
	}
//convert algebraic notation to array
	var algebraicToArray = function(string){
		var arr = string.split('');
		var y = arr[0].charCodeAt(0) - 97;
		var x = 8-arr[1];
		return [x,y];
	}

//produce move text for a given move eg ("fxh7+")
//**** needs edge cases for differentiating between knights/rooks moving to a square where both are possible *****//
	var moveText = function(moveCoordinates, pieceName, isCapture, pawnFile, isCheck, castle, isPassant){
		if(castle == "kingside"){
			return "O-O";
		}
		else if(castle == "queenside"){
			return "O-O-O";
		}
		var result = "";
		//add the name of the piece that is moving, or just the file if it's a pawn
		if(pieceName.toUpperCase() != "P"){
			result += pieceName.toUpperCase();
		}
		else if(pieceName.toUpperCase() == "P" && isCapture){
			result += pawnFile;
		}
		//add capture and the destination square
		if(isCapture){
			result += "x";
		}
		result += arrToAlgebraic(moveCoordinates);
		//add check or en passant
		if(isCheck){
			result += "+";
		}
		if(isPassant){
			result += "e.p."
		}
		return result;
	}

	//takes movetext and logs it to the move list displayed below the chessboard
	var logMove = function(moveText){
		if($.trim($('.moves-list li').last().html()) == ""){
			$('.moves-list li').last().append(game.currentMove + ". " + moveText);
		}
		else{
			$('.moves-list li').last().append( " " + moveText);
			$('.moves-list').append("<li> </li>");
		}
	}

	var getValidMoves = function(square){
		var boardData = game.currentBoardState;
		var currentSquare = algebraicToArray(square);
		var piece = boardData[currentSquare[0]][currentSquare[1]];
		var moveList = getPseudoMoves(boardData, currentSquare[0], currentSquare[1]);
		return validateMovesList(boardData, moveList, piece, currentSquare);
	}

	//internal class for tracking gamestate changes such as player turn/ castleing availability / en passant squares / active square
	function Game(){
		this.boardStates = [];
		this.currentMove = 0;

		this.currentBoardOffset = 0;
		this.currentBoardState = null;
		this.currentPlayer = 1;
		this.whiteCastleKing = true;
		this.whiteCastleQueen = true;
		this.blackCastleKing = true;
		this.blackCastleQueen = true;
		this.activeSquare = null;
		this.currentValidMoves = null;
		this.enPassantSquare = null;
		//render a board from a start position as FENstring
		this.start = function(startFEN){
			this.currentBoardState = FENtoBoardData(startFEN);
			this.boardStates.push(this.currentBoardState);
			renderBoard(this.currentBoardState);
		}
		//move a piece, accepts a coordinate and swaps active square with the coordinates supplied
		this.move = function(x,y, isPassant){
			//copy the current board
			var newBoardState = JSON.parse(JSON.stringify(this.currentBoardState));
			var activeContent = newBoardState[this.activeSquare[0]][this.activeSquare[1]];
			var initialPosition = [this.activeSquare[0], this.activeSquare[1]];
			var isCapture = false;
			//if the move is en passant make sure it logs as a capture
			if(newBoardState[x][y] != "0" || isPassant){
				isCapture = true;
			}
			//if its a double pawn move, make the square behind it an enpassant square
			if(activeContent.toUpperCase() == "P"){
				if(Math.abs((initialPosition[0] - x)) > 1){
					if(this.currentPlayer == 1){
						this.enPassantSquare = [x+1,y];
						$('#' + (8-this.enPassantSquare[0]) + " td").eq(this.enPassantSquare[1]).addClass("passant");
					}
					else if(this.currentPlayer == -1){
						this.enPassantSquare = [x-1,y];
						$('#' + (8-this.enPassantSquare[0]) + " td").eq(this.enPassantSquare[1]).addClass("passant");
					}
				}else{
					this.enPassantSquare = null;
				}
				//if its a pawn promotion call function
				if(this.currentPlayer == 1 && x == 0){

					activeContent = "Q";
				}
				else if(this.currentPlayer == -1 && x == 7){

					activeContent = "q";
				}
			}
			//reset the enpassant square when aother piece is moved
			else{
				this.enPassantSquare = null;
			}

			//swap the pieces to perform the move
			newBoardState[x][y] = activeContent;
			newBoardState[this.activeSquare[0]][this.activeSquare[1]] = "0";

			//adds the newly created boardstate to storage, and updates the current board, and active square
			this.boardStates.push(newBoardState);
			this.currentBoardState = newBoardState;
			this.activeSquare = [x,y];
			// reset the valid moves
			this.currentValidMoves = null;
			// redraw the updatted board
			renderBoard(this.currentBoardState);
			//increment the movecounter for the move logging, when it is whites turn
			if(this.currentPlayer == 1){
				this.currentMove += 1;
			}

			//swap to next players turn and clear the screen
			this.currentPlayer *= -1;
			clearOverlay();

			//look for checks on the board, display them and log them appropriately
			var kingPosition = getKingPosition(this.currentBoardState, this.currentPlayer);
		    if(isCellAttacked(this.currentBoardState, kingPosition[0], kingPosition[1])){
				var currentPos = arrToAlgebraic(initialPosition);

				logMove(moveText([x,y], activeContent, isCapture, currentPos[0], true, false));

				//if there are no possible moves ITS CHECKMATE
				if(NoValidMoves(this.currentBoardState)){
					alert("CheckMate!");
					return
				}
				return
			}
			//when not in check and there are no moves its stalemate
			if(NoValidMoves(this.currentBoardState)){
				alert("StaleMate");
				return
			}
			//log normal and enpassant moves to the move list
			var currentPos = arrToAlgebraic(initialPosition);
			if(isPassant){
				logMove(moveText([x,y], activeContent, isCapture, currentPos[0], false, false, true));
			}
			else{
				logMove(moveText([x,y], activeContent, isCapture, currentPos[0], false, false));
			}
		}

		//called when selecting castling as a move, use "kingside/queenside" for each varient
		this.castle = function(side){
			//set the new positions for both the king and rook
			var castlePosition = [0,0];
			var newKingPosition = [0,0];
			var newCastlePosition = [0,0];
			if(side == "kingside"){
				castlePosition[1] = 7;
				newKingPosition[1] = 6;
				newCastlePosition[1] = 5;
			}
			else if(side == "queenside"){
				castlePosition[1] = 0;
				newKingPosition[1] = 2;
				newCastlePosition[1] = 3;
			}
			//set rank
			if(game.currentPlayer == 1){
				castlePosition[0] = 7;
				newKingPosition[0] = 7;
				newCastlePosition[0] = 7;
			}

			//make a new copy of the board with the updated king and rook positions
			var newBoardState = JSON.parse(JSON.stringify(this.currentBoardState));
			//move king
			newBoardState[newKingPosition[0]][newKingPosition[1]] = newBoardState[this.activeSquare[0]][this.activeSquare[1]];
			newBoardState[this.activeSquare[0]][this.activeSquare[1]] = "0";
			//move castle
			newBoardState[newCastlePosition[0]][newCastlePosition[1]] = newBoardState[castlePosition[0]][castlePosition[1]];
			newBoardState[castlePosition[0]][castlePosition[1]] = "0";
			//log the old position to boardstates and update the current board
			this.boardStates.push(newBoardState);
			this.currentBoardState = newBoardState;
			this.activeSquare = null;
			this.currentValidMoves = null;
			//disable castleing appropriatly so cant castle twice in one game
			if(this.currentPlayer == -1){
				this.blackCastleKing = false;
				this.blackCastleQueen = false;
			}
			else{
				this.whiteCastleKing = false;
				this.whiteCastleQueen = false;
			}
			//draw the new board and swap turns
			renderBoard(this.currentBoardState);
			this.currentPlayer *= -1;
			clearOverlay();
		}

		//make an en passant capture
		this.enPassant = function(x,y){
			//first move the piece as normal
			this.move(x,y,true);
			//removes the pawn captured by en passant
			if(this.currentPlayer == -1){
				this.currentBoardState[x+1][y] = "0";
			}
			if(this.currentPlayer == 1){
				this.currentBoardState[x-1][y] = "0";
			}
			//re render the board
			renderBoard(this.currentBoardState);
			$('td').removeClass('selected active attacker castle passant');
			game.enPassantSquare = null;
		}

	}

	// create event listeners for clicks on board cells to handle user input
	var addEventListeners = function(){
		$('tr td').click(function(){
			game.currentBoardOffset = 0;
			renderBoard(game.currentBoardState);

			var y = $(this).index();
			var x = $(this).parent().index();
			var content = game.currentBoardState[x][y];
			if(game.activeSquare != null){
				var activeContent = game.currentBoardState[game.activeSquare[0]][game.activeSquare[1]];
			}

			if($(this).hasClass("passant") && content.toUpperCase() == "P"){
				for(var i = 0; i < game.currentValidMoves.length; i++){
					if(game.currentValidMoves[i][0] == x && game.currentValidMoves[i][1] == y){
						game.enPassant(x,y);
						return;
					}
				}
			}

			//if clicking on an available move
			if($(this).hasClass("selected") && !$(this).hasClass("passant")){ //AND [x,y] is a coordinate of valid move
				for(var i = 0; i < game.currentValidMoves.length; i++){
					if(game.currentValidMoves[i][0] == x && game.currentValidMoves[i][1] == y){
						if(game.currentPlayer == 1 && activeContent == "k"){
							game.whiteCastleKing = false;
							game.whiteCastleQueen = false;
						}
						else if(game.currentPlayer == -1 && activeContent == "K"){
							game.blackCastleKing = false;
							game.blackCastleQueen = false;
						}
						game.move(x,y);
						return;
					}
				}
			}
			//if clicking on an available move
			if($(this).hasClass("castle")){ //AND [x,y] is a coordinate of valid move
				for(var i = 0; i < game.currentValidMoves.length; i++){
					if(game.currentValidMoves[i][0] == x && game.currentValidMoves[i][1] == y){
						if(y > 4){
							game.castle("kingside");
							logMove(moveText([x,y], null, false, null, true, "kingside"));
						}
						else{
							game.castle("queenside");
							logMove(moveText([x,y], null, false, null, true, "queenside"));
						}
						return;
					}
				}
			}

			//if clicking on a square show any available moves
			clearOverlay();
			if(isOwnPiece(content)){
				$('#' + (8-x) + " td").eq(y).addClass("active");
				game.activeSquare = [x,y];
				var validMoves = validateMovesList(game.currentBoardState, getPseudoMoves(game.currentBoardState,x,y), content, game.activeSquare);
				game.currentValidMoves = validMoves;
				renderMoves(validMoves);
				if(content.toUpperCase() == "K"){
					canCastle(game.currentBoardState);
				}
			}
		});

		//buttons
		$('#previous').click(function(){
			if((game.currentBoardOffset * -1) < game.boardStates.length -1){
				game.currentBoardOffset += -1;
				renderBoard(game.boardStates[game.boardStates.length - 1 + game.currentBoardOffset]);
			}
		});
		$('#next').click(function(){
			if((game.currentBoardOffset * -1) > 0){
				game.currentBoardOffset += 1;
				renderBoard(game.boardStates[game.boardStates.length - 1 + game.currentBoardOffset]);
			}
		});



	}

    var game = new Game();
	//***********************************************************************//
	//******************* PUBLIC *** FUNCTIONS ******************************//
	//***********************************************************************//
	this.setup = function(){
		setUpBoard();
		addEventListeners();
	}

	this.new = function(FENString){
		game.boardStates = [];
		game.currentMove = 0;
		if(FENString){
			game.start(FENString);
			return;
		}
		game.start("rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR");
	}

	this.setPosition = function(FENstring){
		var data = FENstring.split(" ");
		//load the given position
		game.boardStates = [];
		game.currentMove = 0;
		game.start(data[0]);

		//set the player to move
		if(data[1] == "w"){
			game.currentPlayer = 1;
		}
		else if(data[1] == "b"){
			game.currentPlayer = -1;
		}

		//set castling availability - qQKk
		var castlingString = data[2];
		game.whiteCastleKing = false;
		game.whiteCastleQueen = false;
		game.blackCastleKing = false;
		game.blackCastleQueen = false;
		if(castlingString.indexOf('K') != -1){game.whiteCastleKing = true}
		if(castlingString.indexOf('Q') != -1){game.whiteCastleQueen = true}
		if(castlingString.indexOf('k') != -1){game.blackCastleKing = true}
		if(castlingString.indexOf('q') != -1){game.blackCastleQueen = true}

	    //set enpassant square
		if(data[3] != '-'){
			game.enPassantSquare = algebraicToArray(data[3]);
			$('#' + (8-game.enPassantSquare[0]) + " td").eq(game.enPassantSquare[1]).addClass("passant");
		}
	}

	this.clearView = function(){
		clearOverlay();
	}

	this.clearMoves = function(){
		$('.moves-list').empty();
		$('.moves-list').append('<li> </li>');
	}

	this.makeMove = function(square1, square2){
		//game.move relies on active square being set
		var firstSquare = algebraicToArray(square1);
		game.activeSquare = firstSquare;
		var destinationSquare = algebraicToArray(square2);
		var content = game.currentBoardState[firstSquare[0]][firstSquare[1]];
		var validMoves = validateMovesList(game.currentBoardState, getPseudoMoves(game.currentBoardState,firstSquare[0],firstSquare[1]), content, game.activeSquare);
		game.currentValidMoves = validMoves;

		if(game.enPassantSquare && game.enPassantSquare[0] == destinationSquare[0] && game.enPassantSquare[1] == destinationSquare[1]){
			for(var i = 0; i < game.currentValidMoves.length; i++){
				if(game.currentValidMoves[i][0] == destinationSquare[0] && game.currentValidMoves[i][1] == destinationSquare[1]){
					game.enPassant(destinationSquare[0], destinationSquare[1]);
					return
				}
			}
			console.log("INVALID MOVE");
		}
		else{
			for(var i = 0; i < game.currentValidMoves.length; i++){
				if(game.currentValidMoves[i][0] == destinationSquare[0] && game.currentValidMoves[i][1] == destinationSquare[1]){
					game.move(destinationSquare[0], destinationSquare[1], false);
					return
				}
			}
			console.log("INVALID MOVE");
		}
	}

	this.moveSAN = function(san){
		var self = this;
		var san = san.toLowerCase();
		san = san.replace('x', '').replace('+', '');
		var arr = san.split('');

		if((arr[0].toUpperCase() == "B" && arr[1].match(/[a-h]/) != null) || (arr[0].match(/[a-h]/) == null)){ //PIECE MOVES
			//find matching pieces
			var pieces = self.getPiecePositions(arr[0]);
			if(pieces.length == 0){ return "INVALID MOVE" } //cant find piece, invalid move
			else{ // found pieces
				var movestring = "";
				var file = null;
				if(arr[2].match(/[a-h]/) != null){
					movestring = arr.slice(2).join('');
					file = arr[1].toLowerCase().charCodeAt(0) - 97;
				}
				else{ movestring = arr.slice(1,3).join(''); }
				for(var i = 0; i < pieces.length; i++){
					if(file && file != pieces[i][1]){ continue; }
					var validMoves = getValidMoves(arrToAlgebraic(pieces[i]));
					//check if valid moves contain the given san string
					for(var j = 0; j < validMoves.length; j++){
						if(arrToAlgebraic(validMoves[j]) == movestring){
							self.makeMove(arrToAlgebraic(pieces[i]), arrToAlgebraic(validMoves[j]));
							$('#' + (8-validMoves[j][0]) +' td').eq(validMoves[j][1]).addClass('active');
							return
						}
					}
				}
				console.log("INVALID MOVE");
			}
		}

		if(arr[0].match(/[a-h]/) != null){ //Begins with file, pawn move
			//find pawn on the matching file
			var pawns = self.getPawns(arr[0]);
			if(pawns.length == 0){ return "INVALID MOVE" } //no pawn on specified file
			else{
				var movestring = "";
				if(arr[1].match(/[a-h]/) != null){ movestring = arr.slice(1,3).join(''); }
				else{ movestring = arr.slice(0,2).join(''); }
				for(var i = 0; i < pawns.length; i++){
					var validMoves = getValidMoves(arrToAlgebraic(pawns[i]));
					//check if valid moves contain the given san string
					for(var j = 0; j < validMoves.length; j++){
						if(arrToAlgebraic(validMoves[j]) == movestring){
							self.makeMove(arrToAlgebraic(pawns[i]), arrToAlgebraic(validMoves[j]));
							$('#' + (8-validMoves[j][0]) +' td').eq(validMoves[j][1]).addClass('active');
							return
						}
					}
				}
				console.log("INVALID MOVE");
			}
		}
	}

	this.loadPng = function(png){

	}

	this.validMoves = function(san){
		return getValidMoves(san);
	}

	this.getPawns = function(file){
		var boardData = game.currentBoardState;
		var y = file.toLowerCase().charCodeAt(0) - 97;
		var result = [];
		for(var x = 0; x < 8; x++){
			if(boardData[x][y] == "p" && game.currentPlayer == -1){
				result.push([x,y]);
			}
			else if(boardData[x][y] == "P" && game.currentPlayer == 1){
				result.push([x,y]);
			}
		}
		return result;
	}

	this.getPiecePositions = function(piece){
		var boardData = game.currentBoardState;
		var result = [];
		for(var x = 0; x < 8; x++){
			for(var y = 0; y < 8; y++){
				if(boardData[x][y] == piece.toLowerCase() && game.currentPlayer == -1){
					result.push([x,y]);
				}
				else if(boardData[x][y] == piece.toUpperCase() && game.currentPlayer == 1){
					result.push([x,y]);
				}
			}
		}
		return result
	}

	this.getLastMove = function(){
		return $('.moves-list li').last().html();
	}

	this.getCurrentPlayer = function(){
		if(game.currentPlayer == 1){ return "white" }
		else { return "black" }
	}




}
