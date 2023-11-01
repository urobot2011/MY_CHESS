// 화이트의 피스들
const W_P = 0;
const W_R = 1;
const W_B = 2;
const W_N = 3;
const W_Q = 4;
const W_K = 5;

// 블랙의 피스들
const B_P = 6;
const B_R = 7;
const B_B = 8;
const B_N = 9;
const B_Q = 10;
const B_K = 11;

const EMPTY = 0n; // 빈 칸
const RAND = 2n; // 패딩

// 툴
function get(board, square){
	return (board & (1n << BigInt(square)));
}

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

// FEN
function loadFen(fen){
	const [position, turn, castling, enPassant] = fen.split(" ");
  
	let boards = Array(12).fill(0x0000000000000000n);
	const boardRanks = position.split("/");
  
	let index = 11;
	boardRanks.forEach((rank) => {
		for(let i = 0; i < rank.length; i++){
			const symbol = rank[i];
			if(isNaN(+symbol)){
				const piece = pieceMapper(symbol);
				const bit = 1n << BigInt(index);
				boards[piece] |= bit;
				index++;
			} else {
				let idx = parseInt(symbol, 10);
				index += idx;
			}
		}
		for(let i = 0; i < 2; i++) boards.map(b => b | RAND << BigInt(index+i));
		index += 2;
	});
	for(let i = 0; i < 11; i++) boards.map(b => {
		return b | RAND << BigInt(i);
	});
	for(let i = 0; i < 11; i++) boards.map(b => b | RAND << BigInt(i));
  
	return boards;
}
  /*
function rookMoves(square, allPieces, alliancePieces){
	const fileMask = 0x0101010101010101n << BigInt(square % 8); // 세로 마스크
	const rankMask = 0xFFn << (BigInt(square % 8) * 8n); // 가로 마스크

	let moves = fileMask ^ rankMask; // 모든 가로 및 세로 위치를 포함하는 비트 집합
	
	moves &= ~alliancePieces >> 8n; // 룩이 아군 피스를 건너뛸 수 없게 함
	moves &= ~allPieces >> 8n; // 룩이 갈 수 없는 위치를 필터링

	return moves;
}
  */

function slidingAttack(fromBB, occupied, NS, EW) {
    let bb = 0n; // 이동 비트보드 생성
    let dir = NS * 8 + EW;

    for(let shiftedBB = BigInt(fromBB); ; shiftedBB = (shiftedBB & ~occupied) << BigInt(dir)) {
        bb |= shiftedBB;
    }
    return bb;
}


function rookMoves(fromBB, allPieces, alliancePieces) {
    const possibleAttacks = rookAttack(fromBB, allPieces);
    const validMoves = possibleAttacks & ~alliancePieces;
    return validMoves;
}

function rookAttack(fromBB, occupied) {
    return slidingAttack(fromBB, occupied, 0, 1) |
        slidingAttack(fromBB, occupied, 0, -1) |
        slidingAttack(fromBB, occupied, 1, 0) |
        slidingAttack(fromBB, occupied, -1, 0);
}

function printPieceBoard(board){
	let i, j, line = '';
	for(i = 9; i >= 0; i--){
		let row = '';
		for(j = 0; j < 10; j++){
			row += get(board, j + 10 * i) ? '1 ' : '0 ';
		}
		line += row.trim()+'\n';
	}
	return line;
}

function printBoard(boards){
	let i, j, line = '';
	for(i = 0; i < 10; i++){
		let row = '';
		for(j = 0; j < 10; j++){
			const squareIndex = j + 10 * i;
			let pieceFound = '';
			for(let piece = W_P; piece <= B_K; piece++){
				console.log(get(boards[piece], squareIndex));
				if(get(boards[piece], squareIndex)){
					pieceFound = pieceReverseMapper(piece);
					break;
				}
			}
			row += pieceFound ? pieceFound + ' ' : '. ';
		}
		line += row.trim()+'\n';
	}
	return line;
}

function main(){
	const testFen = "8/8/8/8/3RP3/8/8/8 w - - 0 1";
	const boards = loadFen(testFen);
	console.log(printBoard(boards));
	/*
	const myRook = boards[W_R];

	let allPieces = 0n;
	for(let i=0;i<12;i++) allPieces |= boards[i];
	let alliancePieces = 0n;
	for(let i=0;i<6;i++) alliancePieces |= boards[i];
		
	const myRookSquare = Math.log2(Number(myRook)); // 룩의 현재 위치

	const moves = rookMoves(myRookSquare, allPieces, alliancePieces);
  
	console.log("이동 가능한 위치 (비트 보드):", '\n'+printPieceBoard(moves));*/
}
  
main();
