const BOARD_IDX = 120;

// 화이트의 피스들
const W_P = 1;
const W_R = 2;
const W_B = 3;
const W_N = 4;
const W_Q = 5;
const W_K = 6;

// 블랙의 피스들
const B_P = -W_P;
const B_R = -W_R;
const B_B = -W_B;
const B_N = -W_N;
const B_Q = -W_Q;
const B_K = -W_K;

const RAND = 100; // 패딩
const EMPTY = 0; // 빈 칸

// 나머지 상수
const A8 = 21, B8 = 22, C8 = 23, D8 = 24, E8 = 25, F8 = 26, G8 = 27, H8 = 28,
	A7 = 31, B7 = 32, C7 = 33, D7 = 34, E7 = 35, F7 = 36, G7 = 37, H7 = 38,
	A2 = 81, B2 = 82, C2 = 83, D2 = 84, E2 = 85, F2 = 86, G2 = 87, H2 = 88,
	A1 = 91, B1 = 92, C1 = 93, D1 = 94, E1 = 95, F1 = 96, G1 = 97, H1 = 98;

const WHITE_PROMOTES = [A8, B8, C8, D8, E8, F8, G8, H8];
const BLACK_PROMOTES = [A1, B1, C1, D1, E1, F1, G1, H1];

const WHITE_NEAR_PROMOTES = [A7, B7, C7, D7, E7, F7, G7, H7];
const BLACK_NEAR_PROMOTES = [A2, B2, C2, D2, E2, F2, G2, H2];

const WHITE_PAWN = [A2, B2, C2, D2, E2, F2, G2, H2];
const BLACK_PAWN = [A7, B7, C7, D7, E7, F7, G7, H7];

// 보드의 기본 위치
const InitialPosition = [
	RAND, RAND, RAND, RAND, RAND, RAND, RAND, RAND, RAND, RAND,
	RAND, RAND, RAND, RAND, RAND, RAND, RAND, RAND, RAND, RAND,
	RAND, B_R, B_N, B_B, B_Q, B_K, B_B, B_N, B_R, RAND,
	RAND, B_P, B_P, B_P, B_P, B_P, B_P, B_P, B_P, RAND,
	RAND, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, RAND,
	RAND, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, RAND,
	RAND, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, RAND,
	RAND, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, RAND,
	RAND, W_P, W_P, W_P, W_P, W_P, W_P, W_P, W_P, RAND,
	RAND, W_R, W_N, W_B, W_Q, W_K, W_B, W_N, W_R, RAND,
	RAND, RAND, RAND, RAND, RAND, RAND, RAND, RAND, RAND, RAND,
	RAND, RAND, RAND, RAND, RAND, RAND, RAND, RAND, RAND, RAND
];

// 보드
let board = InitialPosition;

// 상태
let game = {};

game.turn = 1;
game.enPassant = EMPTY;
game.castlings = [true, true, true, true];
game.kingLocations = [E1, E8];

game.undos = [];

// Move 인코딩
class Move {
	constructor(from, to, flags, isCapture) {
		this.move = (from & 0xFF) | ((to & 0xFF) << 8) | ((Math.abs(flags) & 0xFF) << 16) | (((isCapture ? 1 : 0) & 0xFF) << 32);
	}
	getFrom(){
		return this.move & 0xFF;
	}
	getTo(){
		return (this.move >> 8) & 0xFF;
	}
	getFlags(){
		return (this.move >> 12) & 0xFF;
	}
	isCapture(){
		return ((this.move >> 32) & 1) === 1;
	}
	isCastling(){
		let rook;
		return [(
			this.getFrom() === E8 && (
				(this.getTo() === G8 && (rook = new Move(H8, F8, 0, false))) ||
				(this.getTo() === C8 && (rook = new Move(A8, D8, 0, false)))
			) ||
			this.getFrom() === E1 && (
				(this.getTo() === G1 && (rook = new Move(H1, F1, 0, false))) ||
				(this.getTo() === C1 && (rook = new Move(A1, D1, 0, false)))
			)
		), rook];
	}
	is2Square(){
		return Math.abs(this.getTo() - this.getFrom()) === 20;
	}
}

// Undo 인코딩
class Undo {
	constructor(){}
	save(){
		this.board = board;
		this.enPassant = game.enPassant;
		this.castlings = game.castlings;
		this.kingLocations = game.kingLocations;
		game.undos.push(this);
	}
	undo(){
		let state = game.undos.pop();
		
		board = state.board;
		game.enPassant = state.enPassant;
		game.castlings = state.castlings;
		game.kingLocations = state.kingLocations;
	}
}

// 툴
function pieceMapper(piece){
	const pieceMapping = {
		'P': W_P, 'R': W_R, 'N': W_N, 'B': W_B, 'Q': W_Q, 'K': W_K,
		'p': B_P, 'r': B_R, 'n': B_N, 'b': B_B, 'q': B_Q, 'k': B_K 
	};
	return pieceMapping[piece];
}

function pieceReverseMapper(piece){
	const reverseMapping = {
		[W_P]: 'P', [W_R]: 'R', [W_N]: 'N', [W_B]: 'B', [W_Q]: 'Q', [W_K]: 'K',
		[B_P]: 'p', [B_R]: 'r', [B_N]: 'n', [B_B]: 'b', [B_Q]: 'q', [B_K]: 'k'
	};
	return reverseMapping[piece] || '';
}

function pieceColor(piece){
	return Math.abs(piece) === piece;
}

function squareMapper(idx){
	const range = [];
	for(let i = 21; i <= 91; i += 10){
		range.push(i);
	}

	const mapping = {
		1: 'a',
		2: 'b',
		3: 'c',
		4: 'd',
		5: 'e',
		6: 'f',
		7: 'g',
		8: 'h',
	};

	let pair = '';
	for(let i = 0; i < range.length; i++){
		if(idx >= range[i] && idx <= range[i] + 7){
			pair = mapping[i + 1] + (idx - range[i] + 1);
			break;
		}
	}

	return pair;
}

function squareReverseMapper(sq){
	return 8 * (sq[0].charCodeAt(0) - 97) + (parseInt(sq[1], 10) - 1);
}

function loadKingLocations(){
	for(let i = 0; i < 64; i++){
		if(board[21+i] === W_K) game.kingLocations[0] = i;
		else if(board[21+i] === B_K) game.kingLocations[1] = i;
	}
}

// 가능한 모든 움직임
function GenerateWhitePieceMoves(idx){
	let moves = [];
	switch(board[idx]){
		case W_P: { // 폰
			if(WHITE_NEAR_PROMOTES.includes(idx)){
				let promoteSq;
				let isCapture = true;
				if(
					(
						board[idx - 10] === EMPTY && 
						(promoteSq = idx - 10) &&
						(isCapture = false)
					) || (
						board[idx - 9] !== RAND && board[idx - 9] !== EMPTY && 
						!pieceColor(board[idx - 9]) &&  
						(promoteSq = idx - 9)
					) || (
						board[idx - 11] !== RAND && board[idx - 11] !== EMPTY &&
						!pieceColor(board[idx - 11]) &&
						(promoteSq = idx - 11)
					)
				){
					moves.push(new Move(idx, promoteSq, W_Q, isCapture));
					moves.push(new Move(idx, promoteSq, W_N, isCapture));
					moves.push(new Move(idx, promoteSq, W_R, isCapture));
					moves.push(new Move(idx, promoteSq, W_B, isCapture));
				}
			} else {
				if(board[idx - 10] === EMPTY){
					moves.push(new Move(idx, idx - 10, 0, false));
					if(WHITE_PAWN.includes(idx)){
						if(board[idx - 20] === EMPTY){
							moves.push(new Move(idx, idx - 20, 0, false));
						}
					}
					let captureSq;
					if(
						(
							board[idx - 9] !== RAND && (
								(board[idx - 9] !== EMPTY && !pieceColor(board[idx - 9])) || 
							(
								game.enPassant !== EMPTY && (idx - 9) === game.enPassant
							)) && 
							(captureSq = idx - 9)
						) || (
							board[idx - 11] !== RAND && (
								(board[idx - 11] !== EMPTY && !pieceColor(board[idx - 11])) || 
							(
								game.enPassant !== EMPTY && (idx - 11) === game.enPassant
							)) && 
							(captureSq = idx - 11)
						)
					){
						moves.push(new Move(idx, captureSq, 0, true));
					}
				}
			}
			break;
		}
		case W_R: { // 룩
			let sq = board[idx];
			[+1, -1, +0.1, -0.1].forEach(element => {
				rook: for(let i = 10; i < 80; i+=10){
					sq = board[idx + (i*element)];
					if(sq === RAND) break rook;
					if(sq !== EMPTY){
						if(!pieceColor(sq)){
							moves.push(new Move(idx, idx + i, 0, true));
						}
						break rook;
					}
					moves.push(new Move(idx, idx + i, 0, false));
				}
			});
			break;
		}
		case W_B: { // 비숍
			let sq = board[idx];
			[+9, +11, -11, -9].forEach(element => {
				bishop: for(let i = 1; i < 8; i++){
					sq = board[idx + (i*element)];
					if(sq === RAND) break bishop;
					if(sq !== EMPTY){
						if(!pieceColor(sq)){
							moves.push(new Move(idx, idx + i, 0, true));
						}
						break bishop;
					}
					moves.push(new Move(idx, idx + i, 0, false));
				}
			});
			break;
		}
		case W_N: { // 나이트
			const knightMoves = [
				-21, -19, -12, -8,
				8, 12, 19, 21
			];

			for(let i = 0; i < knightMoves.length; i++){
				let sq = board[idx + knightMoves[i]];

				if(sq === RAND) continue;
				if(sq === EMPTY || !pieceColor(sq)){
					moves.push(new Move(idx, idx + knightMoves[i], 0, sq !== EMPTY));
				}
			}
			break;
		}
		case W_Q: { // 퀸
			let sq = board[idx];
			[+1, -1, +0.1, -0.1, +0.9, +0.11, -0.11, -0.9].forEach(element => {
				queen: for(let i = 10; i < 80; i+=10){
					sq = board[idx + (i*element)];
					if(sq === RAND) break queen;
					if(sq !== EMPTY){
						if(!pieceColor(sq)){
							moves.push(new Move(idx, idx + i, 0, true));
						}
						break queen;
					}
					moves.push(new Move(idx, idx + i, 0, false));
				}
			});
			break;
		}
		case W_K: { // 킹
			const kingMoves = [+10, -10, +1, -1, +9, +11, -11, -9];

			for(let i = 0; i < kingMoves.length; i++){
				let sq = board[idx + kingMoves[i]];

				if(sq === RAND) continue;
				if(sq === EMPTY || !pieceColor(sq)){
					moves.push(new Move(idx, idx + kingMoves[i], 0, sq !== EMPTY));
				}
			}
			break;
		}
	}
	return moves;
}

function GenerateBlackPieceMoves(idx){
	let moves = [];
	switch(board[idx]){
		case B_P: { // 폰
			if(BLACK_NEAR_PROMOTES.includes(idx)){
				let promiteSq;
				let isCapture = true;
				if(
					(
						board[idx + 10] === EMPTY && 
						(promiteSq = idx + 10) &&
						(isCapture = false)
					) || (
						board[idx + 9] !== RAND && board[idx + 9] !== EMPTY && 
						pieceColor(board[idx + 9]) &&  
						(promiteSq = idx + 9)
					) || (
						board[idx + 11] !== RAND && board[idx + 11] !== EMPTY &&
						pieceColor(board[idx + 11]) &&
						(promiteSq = idx + 11)
					)
				){
					moves.push(new Move(idx, promiteSq, B_Q, isCapture));
					moves.push(new Move(idx, promiteSq, B_N, isCapture));
					moves.push(new Move(idx, promiteSq, B_R, isCapture));
					moves.push(new Move(idx, promiteSq, B_B, isCapture));
				}
			} else {
				if(board[idx + 10] === EMPTY){
					moves.push(new Move(idx, idx + 10, 0, false));
					if(BLACK_PAWN.includes(idx)){
						if(board[idx + 20] === EMPTY){
							moves.push(new Move(idx, idx + 20, 0, false));
						}
					}
					let captureSq;
					if(
						(
							board[idx + 9] !== RAND && (
								(board[idx + 9] !== EMPTY && pieceColor(board[idx + 9])) || 
							(
								game.enPassant !== EMPTY && (idx + 9) === game.enPassant
							)) && 
							(captureSq = idx + 9)
						) || (
							board[idx + 11] !== RAND && (
								(board[idx + 11] !== EMPTY && pieceColor(board[idx + 9])) || 
							(
								game.enPassant !== EMPTY && (idx + 11) === game.enPassant
							)) && 
							(captureSq = idx + 11)
						)
					){
						moves.push(new Move(idx, captureSq, 0, true));
					}
				}
			}
			break;
		}
		case B_R: { // 룩
			let sq = board[idx];
			[+1, -1, +0.1, -0.1].forEach(element => {
				rook: for(let i = 10; i < 80; i+=10){
					sq = board[idx + (i*element)];
					if(sq === RAND) break rook;
					if(sq !== EMPTY){
						if(pieceColor(sq)){
							moves.push(new Move(idx, idx + i, 0, true));
						}
						break rook;
					}
					moves.push(new Move(idx, idx + i, 0, false));
				}
			});
			break;
		}
		case B_B: { // 비숍
			let sq = board[idx];
			[+9, +11, -11, -9].forEach(element => {
				bishop: for(let i = 1; i < 8; i++){
					sq = board[idx + (i*element)];
					if(sq === RAND) break bishop;
					if(sq !== EMPTY){
						if(pieceColor(sq)){
							moves.push(new Move(idx, idx + i, 0, true));
						}
						break bishop;
					}
					moves.push(new Move(idx, idx + i, 0, false));
				}
			});
			break;
		}
		case B_N: { // 나이트 
			const knightMoves = [
				-21, -19, -12, -8,
				8, 12, 19, 21
			];

			for(let i = 0; i < knightMoves.length; i++){
				let sq = board[idx + knightMoves[i]];

				if(sq === RAND) continue;
				if(sq === EMPTY || pieceColor(sq)){
					moves.push(new Move(idx, idx + knightMoves[i], 0, sq !== EMPTY));
				}
			}
			break;
		}
		case B_Q: { // 퀸
			let sq = board[idx];
			[+1, -1, +0.1, -0.1, +0.9, +0.11, -0.11, -0.9].forEach(element => {
				queen: for(let i = 10; i < 80; i+=10){
					sq = board[idx + (i*element)];
					if(sq === RAND) break queen;
					if(sq !== EMPTY){
						if(pieceColor(sq)){
							moves.push(new Move(idx, idx + i, 0, true));
						}
						break queen;
					}
					moves.push(new Move(idx, idx + i, 0, false));
				}
			});
			break;
		}
		case B_K: { // 킹
			const kingMoves = [+10, -10, +1, -1, +9, +11, -11, -9];

			for(let i = 0; i < kingMoves.length; i++){
				let sq = board[idx + kingMoves[i]];

				if(sq === RAND) continue;
				if(sq === EMPTY || pieceColor(sq)){
					moves.push(new Move(idx, idx + kingMoves[i], 0, sq !== EMPTY));
				}
			}
			break;
		}
	}
	return moves;
}

// 공격이 가능한지
function isWhiteAttacked(sq){
	const blackPieces = [B_P, B_R, B_B, B_N, B_Q, B_K];
	const piece = board[sq];

	for(let pieceType of blackPieces){
		board[sq] = pieceType;

		const moves = GenerateBlackPieceMoves(sq);
		for(let move of moves){
			if(board[move.getTo()] !== RAND && !pieceColor(board[move.getTo()])){
				board[sq] = piece;
				return true;
			}
		}
	}

	board[sq] = piece;
	return false;
}

function isBlackAttacked(sq){
	const whitePieces = [W_P, W_R, W_B, W_N, W_Q, W_K];
	const piece = board[sq];

	for(let pieceType of whitePieces){
		board[sq] = pieceType;

		const moves = GenerateWhitePieceMoves(sq);
		for(let move of moves){
			if(board[move.getTo()] !== RAND && pieceColor(board[move.getTo()])){
				board[sq] = piece;
				return true;
			}
		}
	}

	board[sq] = piece;
	return false;
}

// 화이트의 모든 움직임(상대가 체크 가능 수 포함)
function GenerateWhiteMoves(){
	let moves = [];
	if(
		game.castlings[0] && 
		board[G8] === EMPTY && 
		board[F8] === EMPTY && 
		!isBlackAttacked(G1) && 
		!isBlackAttacked(F1)
	){
		moves.push(new Move(E1, G1, 0, false));
	}
	if(
		game.castlings[1] && 
		board[D1] === EMPTY && 
		board[C1] === EMPTY && 
		board[B1] === EMPTY && 
		!isBlackAttacked(D1) && 
		!isBlackAttacked(C1) && 
		!isBlackAttacked(B1)
	){
		moves.push(new Move(E1, C1, 0, false));
	}
	for(let i = 0; i < 99; i++){
		if(board[21+i] === RAND || board[21+i] === EMPTY) continue;
		if(pieceColor(board[21+i])){
			let pieceMoves = GenerateWhitePieceMoves(21+i);
			moves.push(...pieceMoves);
		}
	}
	return moves;
}

// 블랙의 모든 움직임(상대가 체크 가능 수 포함)
function GenerateBlackMoves(){
	let moves = [];
	if(
		game.castlings[2] && 
		board[G8] === EMPTY && 
		board[F8] === EMPTY && 
		!isWhiteAttacked(G8) && 
		!isWhiteAttacked(F8)
	){
		moves.push(new Move(E8, G8, 0, false));
	}
	if(
		game.castlings[3] && 
		board[D8] === EMPTY && 
		board[C8] === EMPTY && 
		board[B8] === EMPTY && 
		!isWhiteAttacked(D8) && 
		!isWhiteAttacked(C8) && 
		!isWhiteAttacked(B8)
	){
		moves.push(new Move(E8, C8, 0, false));
	}
	for(let i = 0; i < 99; i++){
		if(board[21+i] === RAND || board[21+i] === EMPTY) continue;
		if(!pieceColor(board[21+i])){
			let pieceMoves = GenerateBlackPieceMoves(21+i);
			moves.push(...pieceMoves);
		}
	}
	return moves;
}

// 텀에 맞게 모든 움직임 생성
function GenerateAllMoves(){
	return game.turn ? GenerateWhiteMoves() : GenerateBlackMoves()
}

// 움직임 생성
function MakeWhiteMove(move){
	let from = move.getFrom();
	let to = move.getTo();
	let castling = move.isCastling();
	let flag = move.getFlags();
	console.log(squareMapper(from), squareMapper(to));

	if(board[from] === W_K && castling[0]){
		board[to] = W_K;
		board[from] = EMPTY;
		board[castling[1].getTo()] = W_R;
		board[castling[1].getFrom()] = EMPTY;
	} else if(flag !== EMPTY){
		board[to] = flag;
		board[from] = EMPTY;
	} else {
		board[to] = board[from];
		board[from] = EMPTY;
		if(board[to] === W_P && move.is2Square()){
			game.enPassant = to - 10;
		}
	}

	new Undo().save();
}

function MakeBlackMove(move){
	let from = move.getFrom();
	let to = move.getTo();
	let castling = move.isCastling();
	let flag = move.getFlags();

	if(castling[0]){
		board[to] = B_K;
		board[from] = EMPTY;
		board[castling[1].getTo()] = B_R;
		board[castling[1].getFrom()] = EMPTY;
	} else if(flag !== EMPTY){
		board[to] = flag;
		board[from] = EMPTY;
	} else {
		board[to] = board[from];
		board[from] = EMPTY;
		if(board[to] === B_P && move.is2Square()){
			game.enPassant = to + 10;
		}
	}

	new Undo().save();
}

// FEN
function fenToMailbox(fen){
	const [position, turn, castling, enPassant] = fen.split(' ');
  
	// 메일박스 배열 초기화
	const mailboxBoard = new Array(BOARD_IDX).fill(EMPTY);
	const boardRanks = position.split('/');
  
	let index = 21;
	boardRanks.forEach(rank => {
		for(let i = 0; i < rank.length; i++){
			const symbol = rank[i];
			if(isNaN(+symbol)){ // 기호가 숫자가 아니면
				mailboxBoard[index] = pieceMapper(symbol);
				index++;
			} else {
				index += parseInt(symbol, 10);
			}
		}
		index += 2;
	});
  
	// 패딩 칸 채우기
	for(let i = 0; i < 10; i++){
		// 위 칸
	  	mailboxBoard[i] = RAND;
		mailboxBoard[10 + i] = RAND;

		// 아래 칸
		mailboxBoard[100 + i] = RAND;
	  	mailboxBoard[110 + i] = RAND;
	}
	for(let i = 0; i < 100; i = i + 10){
		// 왼쪽 칸
		mailboxBoard[20+i] = RAND;

		// 오른쪽 칸
		mailboxBoard[29+i] = RAND;
	}
	
	game.turn = turn === "w" ? 1 : 0;
	game.enPassant = enPassant === '-' ? EMPTY : squareReverseMapper(enPassant);
	loadKingLocations();

	return mailboxBoard;
}
  
function mailboxToFen(mailboxBoard){
	let fen = '';
	let emptySquares = 0;
  
	for(let i = 21; i < 99; i++){
		const piece = mailboxBoard[i];
	
		if(piece === RAND){
			continue; // 경계 칸은 무시
		}

		if(piece === EMPTY){
			emptySquares++;
		} else {
			if(emptySquares > 0){
				fen += emptySquares;
				emptySquares = 0;
			}
			fen += pieceReverseMapper(piece);
		}

		if(i % 10 === 8){ // 랭크의 끝
			if(emptySquares > 0){
				fen += emptySquares;
				emptySquares = 0;
			}
			if(i < 98){
			  	fen += '/';
			}
			i += 2; // 경계 칸 건너 뛰기
		}
	}
  
	fen += " "+(game.turn ? "w" : "b");

	// todo: 여기에 추가적인 FEN 정보(캐슬링, 앙파상 등)를 추가해야 합니다.
	// 지금은 단순히 피스의 위치만 변환합니다.

	return fen;
}

const fen = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';
const mailboxBoard = fenToMailbox(fen);
board = mailboxBoard;


let loop = 100000;
let startTime = performance.now()
for(let i = 1; i <= loop; i++){
	GenerateAllMoves();
}
let endTime = performance.now()
console.log((endTime - startTime)/loop);

GenerateAllMoves().forEach(move => {
	console.log(squareMapper(move.getFrom()), squareMapper(move.getTo()));
})
