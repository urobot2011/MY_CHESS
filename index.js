const BOARD_IDX = 144;

// 화이트의 피스들
const W_P = 1;
const W_R = 2;
const W_B = 3;
const W_N = 4;
const W_Q = 5;
const W_K = 6;

// 블랙의 피스들
const B_P = 7;
const B_R = 8;
const B_B = 9;
const B_N = 10;
const B_Q = 11;
const B_K = 12;

const RAND = 100; // 패딩
const EMPTY = 0; // 빈 칸

const VAR_TYPE_int = 99; // int 타입

const NO_CAPTURE = 0;
const CAPTURE = 1;
const ENPASSANT_CAPTURE = 2;

// 나머지 상수
const A1 = 110, B1 = 111, C1 = 112, D1 = 113, E1 = 114, F1 = 115, G1 = 116, H1 = 117,
	A8 = 26, B8 = 27, C8 = 28, D8 = 29, E8 = 30, F8 = 31, G8 = 32, H8 = 33;

const BOARD_START_IDX = A8, BOARD_END_IDX = H1+1;

const RANKS = [
	0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
	0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
	0, 0, 8, 8, 8, 8, 8, 8, 8, 8, 0, 0,
	0, 0, 7, 7, 7, 7, 7, 7, 7, 7, 0, 0,
	0, 0, 6, 6, 6, 6, 6, 6, 6, 6, 0, 0,
	0, 0, 5, 5, 5, 5, 5, 5, 5, 5, 0, 0,
	0, 0, 4, 4, 4, 4, 4, 4, 4, 4, 0, 0,
	0, 0, 3, 3, 3, 3, 3, 3, 3, 3, 0, 0,
	0, 0, 2, 2, 2, 2, 2, 2, 2, 2, 0, 0,
	0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0,
	0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
	0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0
];

const FILES = [
	0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
	0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
	0, 0, 1, 2, 3, 4, 5, 6, 7, 8, 0, 0,
	0, 0, 1, 2, 3, 4, 5, 6, 7, 8, 0, 0,
	0, 0, 1, 2, 3, 4, 5, 6, 7, 8, 0, 0,
	0, 0, 1, 2, 3, 4, 5, 6, 7, 8, 0, 0,
	0, 0, 1, 2, 3, 4, 5, 6, 7, 8, 0, 0,
	0, 0, 1, 2, 3, 4, 5, 6, 7, 8, 0, 0,
	0, 0, 1, 2, 3, 4, 5, 6, 7, 8, 0, 0,
	0, 0, 1, 2, 3, 4, 5, 6, 7, 8, 0, 0,
	0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
	0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0
];

// 보드의 기본 위치
const InitialPosition = [
	RAND, RAND, RAND, RAND, RAND, RAND, RAND, RAND, RAND, RAND, RAND, RAND,
	RAND, RAND, RAND, RAND, RAND, RAND, RAND, RAND, RAND, RAND, RAND, RAND,
	RAND, RAND, B_R, B_N, B_B, B_Q, B_K, B_B, B_N, B_R, RAND, RAND,
	RAND, RAND, B_P, B_P, B_P, B_P, B_P, B_P, B_P, B_P, RAND, RAND,
	RAND, RAND, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, RAND, RAND,
	RAND, RAND, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, RAND, RAND,
	RAND, RAND, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, RAND, RAND,
	RAND, RAND, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, RAND, RAND,
	RAND, RAND, W_P, W_P, W_P, W_P, W_P, W_P, W_P, W_P, RAND, RAND,
	RAND, RAND, W_R, W_N, W_B, W_Q, W_K, W_B, W_N, W_R, RAND, RAND,
	RAND, RAND, RAND, RAND, RAND, RAND, RAND, RAND, RAND, RAND, RAND, RAND,
	RAND, RAND, RAND, RAND, RAND, RAND, RAND, RAND, RAND, RAND, RAND, RAND
];

const MAX_HISTORYS = 300;

// 보드
let board = InitialPosition;

// 상태
let game = {};

game.turn = 1;
game.enPassant = EMPTY;
game.enPassantPiece = EMPTY;
game.castlings = [true, true, true, true];
game.kingLocations = [E1, E8];

game.undos = new Array(MAX_HISTORYS);

game.undos_pointer = 0;

// Move 인코딩
class Move {
	constructor(from, to, capture = NO_CAPTURE, castling = EMPTY, pawn2Move = EMPTY, flag = EMPTY){
		this.move = from | (to << 7) | (+capture << 14) | (castling << 16) | (pawn2Move << 23) | flag;
	}
	getFrom(){
		return this.move & 0x7F;
	}
	getTo(){
		return (this.move >> 7) & 0x7F;
	}
	getCapture(){
		return (this.move >> 14) & 0x3;
	}
	getCastling(){
		return (this.move >> 16) & 0x7F;
	}
	getPawn2Move(){
		return (this.move >> 23) & 0x7F;
	}
	getFlags(){
        return this.move >>> 30; 
    }

	isCastling(){
		return this.getCastling() !== EMPTY;
	}
	isPawn2Move(){
		return this.getPawn2Move() !== EMPTY;
	}
	isPromoted(){
		return this.getFlags() !== EMPTY;
	}
}

// 툴
function pieceMapper(piece){
	const mapping = {
		[W_P]: 'P', [W_R]: 'R', [W_N]: 'N', [W_B]: 'B', [W_Q]: 'Q', [W_K]: 'K',
		[B_P]: 'p', [B_R]: 'r', [B_N]: 'n', [B_B]: 'b', [B_Q]: 'q', [B_K]: 'k'
	};
	return mapping[piece] || '';
}

function pieceReverseMapper(piece){
	const mapping = {
		'P': W_P, 'R': W_R, 'N': W_N, 'B': W_B, 'Q': W_Q, 'K': W_K,
		'p': B_P, 'r': B_R, 'n': B_N, 'b': B_B, 'q': B_Q, 'k': B_K 
	};
	return mapping[piece];
}

function pieceColor(piece){
	return +(piece < B_P);
}

function squareMapper(idx){
	let column = String.fromCharCode(96 + FILES[idx]);  

	let row = RANKS[idx];

	return `${column}${row}`;
}

function squareReverseMapper(sq){
	return 25 + (8 - sq[1]) * 12 + (sq.charCodeAt(0) - 96);
}

function loadKingLocations(){
	for(let i = BOARD_START_IDX; i < BOARD_END_IDX; i++){
		if(board[i] === RAND){
			i++;
			continue;
		}

		if(board[i] === W_K) game.kingLocations[0] = i;
		else if(board[i] === B_K) game.kingLocations[1] = i;
	}
}

function saveBoard(){
	let state = new Object();
	state.board = [...board];
	state.enPassant = game.enPassant;
	state.enPassantPiece = game.enPassantPiece;
	state.castlings = [...game.castlings];
	state.kingLocations = [...game.kingLocations];

	game.undos[game.undos_pointer] = state;

	game.undos_pointer++;
}

function TakeMove(){
	game.undos_pointer--;

	let state = game.undos[game.undos_pointer];
	
	board = state.board;
	game.enPassant = state.enPassant;
	game.enPassantPiece = state.enPassantPiece;
	game.castlings = state.castlings;
	game.kingLocations = state.kingLocations;

	game.turn = game.turn ^ 1;
}

// 공격 당하고 있는지
function isAttacked(from, color){
	let pawn = B_P, rook = B_R, bishop = B_B, knight = B_N, queen = B_Q, king = B_K;

	let pawnCapturePositionLeft = -11;
	let pawnCapturePositionRight = -22;

	if(color === 0){
		pawn = W_P, rook = W_R, bishop = W_B, knight = W_N, queen = W_Q, king = W_K;

		pawnCapturePositionLeft = 11;
		pawnCapturePositionRight = 22;
	}

	{ // Pawn
		if(board[from + pawnCapturePositionLeft] === pawn) return 1;
		if(board[from + pawnCapturePositionRight] === pawn) return 1;
	}

	{ // Knight
		if(board[from + 10] === knight) return 1;
		if(board[from - 10] === knight) return 1;
		if(board[from + 23] === knight) return 1;
		if(board[from - 23] === knight) return 1;
		if(board[from + 14] === knight) return 1;
		if(board[from - 14] === knight) return 1;
		if(board[from + 25] === knight) return 1;
		if(board[from - 25] === knight) return 1;
	}

	let sq = VAR_TYPE_int;

	{ // Queen and rook and bishop
		{ // Queen and rook
			sq = from;
			while(board[sq] !== RAND){
				sq += 1;
				if(board[sq] === queen || board[sq] === rook) return 1;
				else if(board[sq] !== EMPTY) break;
			} 

			sq = from;
			while(board[sq] !== RAND){
				sq -= 1;
				if(board[sq] === queen || board[sq] === rook) return 1;
				else if(board[sq] !== EMPTY) break;
			} 

			sq = from;
			while(board[sq] !== RAND){
				sq += 12;
				if(board[sq] === queen || board[sq] === rook) return 1;
				else if(board[sq] !== EMPTY) break;
			} 

			sq = from;
			while(board[sq] !== RAND){
				sq -= 12;
				if(board[sq] === queen || board[sq] === rook) return 1;
				else if(board[sq] !== EMPTY) break;
			} 
		}
		
		{ // Queen and bishop
			sq = from;
			while(board[sq] !== RAND){
				sq += 11;
				if(board[sq] === queen || board[sq] === bishop) return 1;
				else if(board[sq] !== EMPTY) break;
			} 

			sq = from;
			while(board[sq] !== RAND){
				sq -= 11;
				if(board[sq] === queen || board[sq] === bishop) return 1;
				else if(board[sq] !== EMPTY) break;
			} 

			sq = from;
			while(board[sq] !== RAND){
				sq += 13;
				if(board[sq] === queen || board[sq] === bishop) return 1;
				else if(board[sq] !== EMPTY) break;
			} 

			sq = from;
			while(board[sq] !== RAND){
				sq -= 13;
				if(board[sq] === queen || board[sq] === bishop) return 1;
				else if(board[sq] !== EMPTY) break;
			} 
		}
	}

	{ // King
		if(board[from + 11] === king) return 1;
		if(board[from - 11] === king) return 1;
		if(board[from + 13] === king) return 1;
		if(board[from - 13] === king) return 1;
		if(board[from + 12] === king) return 1;
		if(board[from - 12] === king) return 1;
		if(board[from + 1] === king) return 1;
		if(board[from - 1] === king) return 1;
	}

	return 0;
}

// 가능한 모든 움직임(상대가 체크 가능 수 포함)
function GenerateMoves(){
	let moves = [];
	let movesPos = 0;

	let pawn = W_P, rook = W_R, bishop = W_B, knight = W_N, queen = W_Q, king = W_K;

	let pawnMovePosition = -12;
	let pawn2MovePosition = -24;
	let pawnCapturePositionLeft = -11;
	let pawnCapturePositionRight = -22;

	let pawn2MoveRank = 2;

	let pawnPromotionRank = 8;

	let sq = VAR_TYPE_int;

	if(game.turn === 0){
		pawn = B_P, rook = B_R, bishop = B_B, knight = B_N, queen = B_Q, king = B_K;

		pawnMovePosition = 12;
		pawn2MovePosition = 24;
		pawnCapturePositionLeft = 11;
		pawnCapturePositionRight = 22;

		pawn2MoveRank = 7;

		pawnPromotionRank = 1;

		if(
			game.castlings[2] && 
			board[G8] === EMPTY && 
			board[F8] === EMPTY &&  
			!isAttacked(E8, 0) && 
			!isAttacked(G8, 0) && 
			!isAttacked(F8, 0)
		){
			moves[movesPos++] = new Move(E8, G8, false, H8 | (F8 >> 7));
		}
		if(
			game.castlings[3] && 
			board[D8] === EMPTY && 
			board[C8] === EMPTY && 
			board[B8] === EMPTY &&  
			!isAttacked(E8, 0) && 
			!isAttacked(D8, 0) && 
			!isAttacked(C8, 0) && 
			!isAttacked(B8, 0)
		){
			moves[movesPos++] = new Move(E8, C8, false, A8 | (D8 >> 7));
		}

	} else {
		if(
			game.castlings[0] && 
			board[G8] === EMPTY && 
			board[F8] === EMPTY && 
			!isAttacked(E1, 1) && 
			!isAttacked(G1, 1) && 
			!isAttacked(F1, 1)
		){
			moves[movesPos++] = new Move(E1, G1, false, H1 | (F1 >> 7));
		}
		if(
			game.castlings[1] && 
			board[D1] === EMPTY && 
			board[C1] === EMPTY && 
			board[B1] === EMPTY &&  
			!isAttacked(E1, 1) && 
			!isAttacked(D1, 1) && 
			!isAttacked(C1, 1) && 
			!isAttacked(B1, 1)
		){
			moves[movesPos++] = new Move(E1, C1, false, A1 | (D1 >> 7));
		}
	}

	for(let i = BOARD_START_IDX; i < BOARD_END_IDX; i++){
		if(board[i] === RAND || board[i] === EMPTY) continue;

		if(board[i] === pawn){ // Pawn
			if(RANKS[i + pawnMovePosition] === pawnPromotionRank && board[i + pawnMovePosition] === EMPTY){
				moves[movesPos++] = new Move(i, i + pawnMovePosition, NO_CAPTURE, EMPTY, EMPTY, rook);
				moves[movesPos++] = new Move(i, i + pawnMovePosition, NO_CAPTURE, EMPTY, EMPTY, bishop);
				moves[movesPos++] = new Move(i, i + pawnMovePosition, NO_CAPTURE, EMPTY, EMPTY, knight);
				moves[movesPos++] = new Move(i, i + pawnMovePosition, NO_CAPTURE, EMPTY, EMPTY, queen);

				if(
					board[i + pawnCapturePositionLeft] !== RAND && 
					board[i + pawnCapturePositionLeft] !== EMPTY &&
					pieceColor(board[i + pawnCapturePositionLeft]) !== game.turn
				){
					moves[movesPos++] = new Move(i, i + pawnCapturePositionLeft, CAPTURE, EMPTY, EMPTY, rook);
					moves[movesPos++] = new Move(i, i + pawnCapturePositionLeft, CAPTURE, EMPTY, EMPTY, bishop);
					moves[movesPos++] = new Move(i, i + pawnCapturePositionLeft, CAPTURE, EMPTY, EMPTY, knight);
					moves[movesPos++] = new Move(i, i + pawnCapturePositionLeft, CAPTURE, EMPTY, EMPTY, queen);
				}
				if(
					board[i + pawnCapturePositionRight] !== RAND && 
					board[i + pawnCapturePositionRight] !== EMPTY &&
					pieceColor(board[i + pawnCapturePositionRight]) !== game.turn
				){
					moves[movesPos++] = new Move(i, i + pawnCapturePositionRight, CAPTURE, EMPTY, EMPTY, rook);
					moves[movesPos++] = new Move(i, i + pawnCapturePositionRight, CAPTURE, EMPTY, EMPTY, bishop);
					moves[movesPos++] = new Move(i, i + pawnCapturePositionRight, CAPTURE, EMPTY, EMPTY, knight);
					moves[movesPos++] = new Move(i, i + pawnCapturePositionRight, CAPTURE, EMPTY, EMPTY, queen);
				}

				continue;
			}

			if(board[i + pawnMovePosition] === EMPTY){
				moves[movesPos++] = new Move(i, i + pawnMovePosition);
				if(RANKS[i] === pawn2MoveRank && board[i + pawn2MovePosition] === EMPTY){
					moves[movesPos++] = new Move(i, i + pawn2MovePosition, NO_CAPTURE, EMPTY, i + pawnMovePosition);
				}
			}

			if(
				board[i + pawnCapturePositionLeft] !== RAND && 
				board[i + pawnCapturePositionLeft] !== EMPTY &&
				pieceColor(board[i + pawnCapturePositionLeft]) !== game.turn
			) moves[movesPos++] = new Move(i, i + pawnCapturePositionLeft, CAPTURE);
			
			if(
				board[i + pawnCapturePositionRight] !== RAND && 
				board[i + pawnCapturePositionRight] !== EMPTY &&
				pieceColor(board[i + pawnCapturePositionRight]) !== game.turn
			) moves[movesPos++] = new Move(i, i + pawnCapturePositionRight, CAPTURE);

			if(game.enPassant !== EMPTY){
				if(game.enPassant === i + pawnCapturePositionLeft){
					moves[movesPos++] = new Move(i, i + pawnCapturePositionLeft, ENPASSANT_CAPTURE);
				}
				if(game.enPassant === i + pawnCapturePositionRight){
					moves[movesPos++] = new Move(i, i + pawnCapturePositionRight, ENPASSANT_CAPTURE);
				}
			}

			continue;
		}

		if(board[i] === rook){ // Rook
			sq = i + 1;
			while(board[sq] !== RAND){
				if(board[sq] !== EMPTY){
					if(pieceColor(board[sq]) !== game.turn){
						moves[movesPos++] = new Move(i, sq, CAPTURE);
					}
					break;
				}
				moves[movesPos++] = new Move(i, sq, NO_CAPTURE);
				sq += 1;
			} 

			sq = i - 1;
			while(board[sq] !== RAND){
				if(board[sq] !== EMPTY){
					if(pieceColor(board[sq]) !== game.turn){
						moves[movesPos++] = new Move(i, sq, CAPTURE);
					}
					break;
				}
				moves[movesPos++] = new Move(i, sq, NO_CAPTURE);
				sq -= 1;
			} 

			sq = i + 12;
			while(board[sq] !== RAND){
				if(board[sq] !== EMPTY){
					if(pieceColor(board[sq]) !== game.turn){
						moves[movesPos++] = new Move(i, sq, CAPTURE);
					}
					break;
				}
				moves[movesPos++] = new Move(i, sq, NO_CAPTURE);
				sq += 12;
			} 

			sq = i - 12;
			while(board[sq] !== RAND){
				if(board[sq] !== EMPTY){
					if(pieceColor(board[sq]) !== game.turn){
						moves[movesPos++] = new Move(i, sq, CAPTURE);
					}
					break;
				}
				moves[movesPos++] = new Move(i, sq, NO_CAPTURE);
				sq -= 12;
			} 
		}

		if(board[i] === bishop){ // Bishop
			sq = i + 11;
			while(board[sq] !== RAND){
				if(board[sq] !== EMPTY){
					if(pieceColor(board[sq]) !== game.turn){
						moves[movesPos++] = new Move(i, sq, CAPTURE);
					}
					break;
				}
				moves[movesPos++] = new Move(i, sq, NO_CAPTURE);
				sq += 11;
			} 

			sq = i - 11;
			while(board[sq] !== RAND){
				if(board[sq] !== EMPTY){
					if(pieceColor(board[sq]) !== game.turn){
						moves[movesPos++] = new Move(i, sq, CAPTURE);
					}
					break;
				}
				moves[movesPos++] = new Move(i, sq, NO_CAPTURE);
				sq -= 11;
			} 

			sq = i + 13;
			while(board[sq] !== RAND){
				if(board[sq] !== EMPTY){
					if(pieceColor(board[sq]) !== game.turn){
						moves[movesPos++] = new Move(i, sq, CAPTURE);
					}
					break;
				}
				moves[movesPos++] = new Move(i, sq, NO_CAPTURE);
				sq += 13;
			} 

			sq = i - 13;
			while(board[sq] !== RAND){
				if(board[sq] !== EMPTY){
					if(pieceColor(board[sq]) !== game.turn){
						moves[movesPos++] = new Move(i, sq, CAPTURE);
					}
					break;
				}
				moves[movesPos++] = new Move(i, sq, NO_CAPTURE);
				sq -= 13;
			} 
		}

		if(board[i] === knight){ // Knight
			if(board[i + 10] !== RAND){
				if(board[i + 10] === EMPTY || (board[i + 10] !== EMPTY && pieceColor(board[i + 10]) !== game.turn)) moves[movesPos++] = new Move(i, i + 10, board[i + 10] !== EMPTY);
			}
			if(board[i - 10] !== RAND){
				if(board[i - 10] === EMPTY || (board[i - 10] !== EMPTY && pieceColor(board[i - 10]) !== game.turn)) moves[movesPos++] = new Move(i, i - 10, board[i - 10] !== EMPTY);
			}
			if(board[i + 23] !== RAND){
				if(board[i + 23] === EMPTY || (board[i + 23] !== EMPTY && pieceColor(board[i + 23]) !== game.turn)) moves[movesPos++] = new Move(i, i + 23, board[i + 23] !== EMPTY);
			}
			if(board[i - 23] !== RAND){
				if(board[i - 23] === EMPTY || (board[i - 23] !== EMPTY && pieceColor(board[i - 23]) !== game.turn)) moves[movesPos++] = new Move(i, i - 23, board[i - 23] !== EMPTY);
			}
			if(board[i + 14] !== RAND){
				if(board[i + 14] === EMPTY || (board[i + 14] !== EMPTY && pieceColor(board[i + 14]) !== game.turn)) moves[movesPos++] = new Move(i, i + 14, board[i + 14] !== EMPTY);
			}
			if(board[i - 14] !== RAND){
				if(board[i - 14] === EMPTY || (board[i - 14] !== EMPTY && pieceColor(board[i - 14]) !== game.turn)) moves[movesPos++] = new Move(i, i - 14, board[i - 14] !== EMPTY);
			}
			if(board[i + 25] !== RAND){
				if(board[i + 25] === EMPTY || (board[i + 25] !== EMPTY && pieceColor(board[i + 25]) !== game.turn)) moves[movesPos++] = new Move(i, i + 25, board[i + 25] !== EMPTY);
			}
			if(board[i - 25] !== RAND){
				if(board[i - 25] === EMPTY || (board[i - 25] !== EMPTY && pieceColor(board[i - 25]) !== game.turn)) moves[movesPos++] = new Move(i, i - 25, board[i - 25] !== EMPTY);
			}

			continue;
		}
	
		if(board[i] === queen){ // Queen
			sq = i + 1;
			while(board[sq] !== RAND){
				if(board[sq] !== EMPTY){
					if(pieceColor(board[sq]) !== game.turn){
						moves[movesPos++] = new Move(i, sq, CAPTURE);
					}
					break;
				}
				moves[movesPos++] = new Move(i, sq, NO_CAPTURE);
				sq += 1;
			} 

			sq = i - 1;
			while(board[sq] !== RAND){
				if(board[sq] !== EMPTY){
					if(pieceColor(board[sq]) !== game.turn){
						moves[movesPos++] = new Move(i, sq, CAPTURE);
					}
					break;
				}
				moves[movesPos++] = new Move(i, sq, NO_CAPTURE);
				sq -= 1;
			} 

			sq = i + 12;
			while(board[sq] !== RAND){
				if(board[sq] !== EMPTY){
					if(pieceColor(board[sq]) !== game.turn){
						moves[movesPos++] = new Move(i, sq, CAPTURE);
					}
					break;
				}
				moves[movesPos++] = new Move(i, sq, NO_CAPTURE);
				sq += 12;
			} 

			sq = i - 12;
			while(board[sq] !== RAND){
				if(board[sq] !== EMPTY){
					if(pieceColor(board[sq]) !== game.turn){
						moves[movesPos++] = new Move(i, sq, CAPTURE);
					}
					break;
				}
				moves[movesPos++] = new Move(i, sq, NO_CAPTURE);
				sq -= 12;
			} 

			sq = i + 11;
			while(board[sq] !== RAND){
				if(board[sq] !== EMPTY){
					if(pieceColor(board[sq]) !== game.turn){
						moves[movesPos++] = new Move(i, sq, CAPTURE);
					}
					break;
				}
				moves[movesPos++] = new Move(i, sq, NO_CAPTURE);
				sq += 11;
			} 

			sq = i - 11;
			while(board[sq] !== RAND){
				if(board[sq] !== EMPTY){
					if(pieceColor(board[sq]) !== game.turn){
						moves[movesPos++] = new Move(i, sq, CAPTURE);
					}
					break;
				}
				moves[movesPos++] = new Move(i, sq, NO_CAPTURE);
				sq -= 11;
			} 

			sq = i + 13;
			while(board[sq] !== RAND){
				if(board[sq] !== EMPTY){
					if(pieceColor(board[sq]) !== game.turn){
						moves[movesPos++] = new Move(i, sq, CAPTURE);
					}
					break;
				}
				moves[movesPos++] = new Move(i, sq, NO_CAPTURE);
				sq += 13;
			} 

			sq = i - 13;
			while(board[sq] !== RAND){
				if(board[sq] !== EMPTY){
					if(pieceColor(board[sq]) !== game.turn){
						moves[movesPos++] = new Move(i, sq, CAPTURE);
					}
					break;
				}
				moves[movesPos++] = new Move(i, sq, NO_CAPTURE);
				sq -= 13;
			} 
		}

		if(board[i] === knight){ // King
			if(board[i + 11] !== RAND){
				if(board[i + 11] === EMPTY || (board[i + 11] !== EMPTY && pieceColor(board[i + 11]) !== game.turn)) moves[movesPos++] = new Move(i, i + 11, board[i + 11] !== EMPTY);
			}
			if(board[i - 11] !== RAND){
				if(board[i - 11] === EMPTY || (board[i - 11] !== EMPTY && pieceColor(board[i - 11]) !== game.turn)) moves[movesPos++] = new Move(i, i - 11, board[i - 11] !== EMPTY);
			}
			if(board[i + 13] !== RAND){
				if(board[i + 13] === EMPTY || (board[i + 13] !== EMPTY && pieceColor(board[i + 13]) !== game.turn)) moves[movesPos++] = new Move(i, i + 13, board[i + 13] !== EMPTY);
			}
			if(board[i - 13] !== RAND){
				if(board[i - 13] === EMPTY || (board[i - 13] !== EMPTY && pieceColor(board[i - 13]) !== game.turn)) moves[movesPos++] = new Move(i, i - 13, board[i - 13] !== EMPTY);
			}
			if(board[i + 12] !== RAND){
				if(board[i + 12] === EMPTY || (board[i + 12] !== EMPTY && pieceColor(board[i + 12]) !== game.turn)) moves[movesPos++] = new Move(i, i + 12, board[i + 12] !== EMPTY);
			}
			if(board[i - 12] !== RAND){
				if(board[i - 12] === EMPTY || (board[i - 12] !== EMPTY && pieceColor(board[i - 12]) !== game.turn)) moves[movesPos++] = new Move(i, i - 12, board[i - 12] !== EMPTY);
			}
			if(board[i + 1] !== RAND){
				if(board[i + 1] === EMPTY || (board[i + 1] !== EMPTY && pieceColor(board[i + 1]) !== game.turn)) moves[movesPos++] = new Move(i, i + 1, board[i + 1] !== EMPTY);
			}
			if(board[i - 1] !== RAND){
				if(board[i - 1] === EMPTY || (board[i - 1] !== EMPTY && pieceColor(board[i - 1]) !== game.turn)) moves[movesPos++] = new Move(i, i - 1, board[i - 1] !== EMPTY);
			}
			
			continue;
		}
	}

	return moves;
}

// 움직임
function MakeMove(move){
	saveBoard();

	let pawn = W_P, rook = W_R, king = W_K;

	if(game.turn === 0){
		pawn = B_P, rook = B_R, king = B_K;
	}

	let from = move.getFrom();
	let to = move.getTo();
	let capture = move.getCapture();
	let castling = move.getCastling();
	let flag = move.getFlags();

	let piece = board[from];

	if(castling !== EMPTY){
		board[to] = king;
		board[from] = EMPTY;
		board[castling & 0x7F] = EMPTY;
		board[(castling >> 7) & 0x7F] = rook;
	} else if(flag !== EMPTY){
		board[to] = flag;
		board[from] = EMPTY;

		game.enPassant = EMPTY;
	} else if(capture === ENPASSANT_CAPTURE){
		board[to] = piece;
		board[game.enPassantPiece] = EMPTY;
		board[from] = EMPTY;

		game.enPassant = EMPTY;
	} else {
		board[to] = piece;
		board[from] = EMPTY;

		game.enPassant = EMPTY;

		if(piece === pawn && move.isPawn2Move()){
			game.enPassant = move.getPawn2Move();
			game.enPassantPiece = to;
		} else if(piece === king){
			if(game.turn === 1){
				game.kingLocations[0] = to;
				game.castlings[0] = false;
				game.castlings[1] = false;
			} else {
				game.kingLocations[1] = to;
				game.castlings[2] = false;
				game.castlings[3] = false;
			}
		} else if(piece === rook){
			if(game.turn === 1){
				if(from === A1){
					game.castlings[0] = false;
				} else if(from === H1){
					game.castlings[1] = false;
				}
			} else {
				if(from === A8){
					game.castlings[2] = false;
				} else if(from === H8){
					game.castlings[3] = false;
				}
			}
		}
	}

	game.turn = game.turn ^ 1;

	if(isAttacked(game.kingLocations[+game.turn], +!game.turn)){
		TakeMove();

		return false;
	}

	return true;
}

// FEN
function loadFEN(fen){
	const [position, turn, castling, enPassant] = fen.split(' ');

	// 메일박스 배열 초기화
	board = new Array(BOARD_IDX).fill(EMPTY);
	const boardRanks = position.split('/');
  
	let index = A8;
	boardRanks.forEach(rank => {
		for(let i = 0; i < rank.length; i++){
			const symbol = rank[i];
			if(isNaN(+symbol)){ // 기호가 숫자가 아니면
				board[index] = pieceReverseMapper(symbol);
				index++;
			} else {
				index += parseInt(symbol, 10);
			}
		}
		index -= 20;
	});

	game.turn = turn === "w" ? 1 : 0;

	game.castlings[0] = castling.includes('Q');
	game.castlings[1] = castling.includes('K');
	game.castlings[2] = castling.includes('q');
	game.castlings[3] = castling.includes('k');

	if(enPassant !== '-'){
		game.enPassant = squareReverseMapper(enPassant); 
		game.enPassantPiece = game.turn ? game.enPassant + 12 : game.enPassant - 12;
    } else {
        game.enPassantPiece = EMPTY;
        game.enPassant = EMPTY;
    }

	loadKingLocations();
}
  
function getFEN(){
	let fen = '';
	let emptySquares = 0;

	let rank = 0;
	let file = 0;

	for(let i = BOARD_START_IDX; i < BOARD_END_IDX; i++){
		if(board[i] === RAND) continue;

		if(board[i] === EMPTY){
			emptySquares++;
		} else {
			if(emptySquares > 0){
				fen += emptySquares.toString();
				emptySquares = 0;
			}
			fen += pieceMapper(board[i]);
		}

		file++;

		if(file > 7){
			file = 0;
			rank++;

			if(emptySquares > 0){
				fen += emptySquares.toString();
				emptySquares = 0;
			}

			if(rank < 8) fen += '/';
		}

	}

	fen += " " + (game.turn ? "w" : "b");

	let castleString = '';
	if(game.castlings[1]) castleString += 'K';
	if(game.castlings[0]) castleString += 'Q';
	if(game.castlings[3]) castleString += 'k';
	if(game.castlings[2]) castleString += 'q';

	castleString = (castleString === '') ? '-' : castleString;

	fen += " " + castleString;

	let enPassant = game.enPassant === EMPTY ? "-" : squareMapper(game.enPassant);

	fen += " " + enPassant;

	return fen;
}

function printBoard(){
	let str = '';
	let line = '';

	let file = 0;

	for(let i = BOARD_START_IDX; i < BOARD_END_IDX; i++){
		if(board[i] === RAND) continue;

		if(board[i] === EMPTY) line += '.';
		else line += pieceMapper(board[i]);

		line += ' ';

		file++;

		if(file > 7){
			file = 0;
			str += line.trimEnd();
			str += '\n';

			line = '';
		}
	}
	return str.trimEnd();
}

/*
let loop = 100000;
let startTime = performance.now()
for(let i = 1; i <= loop; i++){
	GenerateAllMoves();
}
let endTime = performance.now()
console.log((endTime - startTime)/loop);
*/
console.log(getFEN());
GenerateMoves().forEach(move => {
	console.log(squareMapper(move.getFrom()), squareMapper(move.getTo()));
});

console.log(printBoard());

MakeMove(GenerateMoves()[1]);
console.log(printBoard());
TakeMove();
console.log(printBoard());

function Perft(depth){
	let moveNum = 0;

	if(depth === 1){
		return GenerateMoves().length;
  	}

	let moves = GenerateMoves();

	for(let i = 0; i < moves.length; i++){
		if(!MakeMove(moves[i])) continue;
		moveNum += Perft(depth-1);
		TakeMove();
	}

	return moveNum;
}

let startTime = performance.now();
Perft(1);
let endTime = performance.now();
console.log(endTime - startTime);

console.log(getFEN());
