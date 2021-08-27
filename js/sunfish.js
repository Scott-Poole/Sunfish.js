///////////////////////////////////////////////////////////////////////////////
// Piece-Square tables. Tune these to change sunfish's behaviour
///////////////////////////////////////////////////////////////////////////////

const piece = { 'P': 100, 'N': 280, 'B': 320, 'R': 479, 'Q': 929, 'K': 60000 }
var pst = {
    'P': [   0,   0,   0,   0,   0,   0,   0,   0,
            78,  83,  86,  73, 102,  82,  85,  90,
             7,  29,  21,  44,  40,  31,  44,   7,
           -17,  16,  -2,  15,  14,   0,  15, -13,
           -26,   3,  10,   9,   6,   1,   0, -23,
           -22,   9,   5, -11, -10,  -2,   3, -19,
           -31,   8,  -7, -37, -36, -14,   3, -31,
             0,   0,   0,   0,   0,   0,   0,   0],
    'N': [ -66, -53, -75, -75, -10, -55, -58, -70,
            -3,  -6, 100, -36,   4,  62,  -4, -14,
            10,  67,   1,  74,  73,  27,  62,  -2,
            24,  24,  45,  37,  33,  41,  25,  17,
            -1,   5,  31,  21,  22,  35,   2,   0,
           -18,  10,  13,  22,  18,  15,  11, -14,
           -23, -15,   2,   0,   2,   0, -23, -20,
           -74, -23, -26, -24, -19, -35, -22, -69],
    'B': [ -59, -78, -82, -76, -23,-107, -37, -50,
           -11,  20,  35, -42, -39,  31,   2, -22,
            -9,  39, -32,  41,  52, -10,  28, -14,
            25,  17,  20,  34,  26,  25,  15,  10,
            13,  10,  17,  23,  17,  16,   0,   7,
            14,  25,  24,  15,   8,  25,  20,  15,
            19,  20,  11,   6,   7,   6,  20,  16,
            -7,   2, -15, -12, -14, -15, -10, -10],
    'R': [  35,  29,  33,   4,  37,  33,  56,  50,
            55,  29,  56,  67,  55,  62,  34,  60,
            19,  35,  28,  33,  45,  27,  25,  15,
             0,   5,  16,  13,  18,  -4,  -9,  -6,
           -28, -35, -16, -21, -13, -29, -46, -30,
           -42, -28, -42, -25, -25, -35, -26, -46,
           -53, -38, -31, -26, -29, -43, -44, -53,
           -30, -24, -18,   5,  -2, -18, -31, -32],
    'Q': [   6,   1,  -8,-104,  69,  24,  88,  26,
            14,  32,  60, -10,  20,  76,  57,  24,
            -2,  43,  32,  60,  72,  63,  43,   2,
             1, -16,  22,  17,  25,  20, -13,  -6,
           -14, -15,  -2,  -5,  -1, -10, -20, -22,
           -30,  -6, -13, -11, -16, -11, -16, -27,
           -36, -18,   0, -19, -15, -15, -21, -38,
           -39, -30, -31, -13, -31, -36, -34, -42],
    'K': [   4,  54,  47, -99, -99,  60,  83, -62,
           -32,  10,  55,  56,  56,  55,  10,   3,
           -62,  12, -57,  44, -67,  28,  37, -31,
           -55,  50,  11,  -4, -19,  13,   0, -49,
           -55, -43, -52, -28, -51, -47,  -8, -50,
           -47, -42, -43, -79, -64, -32, -29, -32,
            -4,   3, -14, -50, -57, -18,  13,   4,
            17,  30,  -3, -14,   6,  -1,  40,  18],
}
// Pad tables and join piece and pst dictionaries
var pad = [0,0,0,0,0,0,0,0,0,0,
		   0,0,0,0,0,0,0,0,0,0]
for(var k in pst){
	//combine pst and piece in pst
	var i
	for(i = 0; i < pst[k].length; i++){
		pst[k][i] += piece[k]
	}
	//pad "columns"
	for(i = 0; i < pst[k].length; i+=10){
		pst[k].splice(i,0,0)
		pst[k].splice(i+9,0,0)
	}
	//pad extra rows
	pst[k] = pst[k].concat(pad)
	pst[k] = pad.concat(pst[k])
}

///////////////////////////////////////////////////////////////////////////////
// Global constants
///////////////////////////////////////////////////////////////////////////////

// Our board is represented as a 120 character string. The padding allows for
// fast detection of moves that don't stay within the board.
const A1 = 91, H1 = 98, A8 = 21, H8 = 28
const initial = 
    '         \n' +  //   0 -  9
    '         \n' +  //  10 - 19
    ' rnbqkbnr\n' +  //  20 - 29
    ' pppppppp\n' +  //  30 - 39
    ' ........\n' +  //  40 - 49
    ' ........\n' +  //  50 - 59
    ' ........\n' +  //  60 - 69
    ' ........\n' +  //  70 - 79
    ' PPPPPPPP\n' +  //  80 - 89
    ' RNBQKBNR\n' +  //  90 - 99
    '         \n' +  // 100 -109
    '         \n'    // 110 -119

// Lists of possible moves for each piece type.
const N = -10, E = 1, S = 10, W = -1
const directions = {
    'P': [N, N+N, N+W, N+E],
    'N': [N+N+E, E+N+E, E+S+E, S+S+E, S+S+W, W+S+W, W+N+W, N+N+W],
    'B': [N+E, S+E, S+W, N+W],
    'R': [N, E, S, W],
    'Q': [N, E, S, W, N+E, S+E, S+W, N+W],
    'K': [N, E, S, W, N+E, S+E, S+W, N+W]
}

// Mate value must be greater than 8*queen + 2*(rook+knight+bishop)
// King value is set to twice this value such that if the opponent is
// 8 queens up, but we got the king, we still exceed MATE_VALUE.
// When a MATE is detected, we'll set the score to MATE_UPPER - plies to get there
// E.g. Mate in 3 will be MATE_UPPER - 6
const MATE_LOWER = piece['K'] - 10*piece['Q']
const MATE_UPPER = piece['K'] + 10*piece['Q']

// The table size is the maximum number of elements in the transposition table.
const TABLE_SIZE = 1e7

// Constants for tuning search
const QS_LIMIT = 219
const EVAL_ROUGHNESS = 13
const DRAW_TEST = true


///////////////////////////////////////////////////////////////////////////////
// Chess logic
///////////////////////////////////////////////////////////////////////////////

class Position{
    /* A state of a chess game
    board -- a 120 char representation of the board
    score -- the board evaluation
    wc -- the castling rights, [west/queen side, east/king side]
    bc -- the opponent castling rights, [west/king side, east/queen side]
    ep - the en passant square
    kp - the king passant square
    */
	constructor(board, score, wc, bc, ep, kp){
		this.board = board
		this.score = score
		this.wc = wc
		this.bc = bc
		this.ep = ep
		this.kp = kp
	}
	toStr(){
		return this.board + this.score + this.wc[0] + this.wc[1]+ this.bc[0]+ this.bc[1] + this.ep + this.kp
		//return this.board
	}
    *gen_moves(){
        // For each of our pieces, iterate through each possible 'ray' of moves,
        // as defined in the 'directions' map. The rays are broken e.g. by
        // captures or immediately in case of pieces such as knights.
        for(var i = 0; i < this.board.length; i++){
			//if char not uppercase, skip
			if(this.board.charCodeAt(i) < 65 || this.board.charCodeAt(i) > 90){
				continue
			}
			for(var d of directions[this.board[i]]){
				for(var target = i + d; ; target+=d){
					var q = this.board[target]
					// Stay inside the board, and off friendly pieces
					// if space, return, or uppercase, break
					if(q == ' ' || q == '\n' || (q.charCodeAt(0) >= 65 && q.charCodeAt(0) <= 90)){
						break
					}
					
					// Pawn move, double move and capture
					if(this.board[i] == 'P'){
						if((d == N || d == N+N) && q != '.'){
							break
						}
						if(d == N+N && (i < A1+N || this.board[i+N] != '.')){
							break
						}
						if((d == N+W || d == N+E) && q == '.' && target != this.ep &&
							target != this.kp && target != this.kp-1 && target != this.kp+1){
							break
						}
					}
					//move generated
					yield [i, target]
					
					//Stop crawlers from sliding, and sliding after captures
					//if pawn,knight,king or lowercase(enemy capture), break
					if('PNK'.includes(this.board[i]) || (q.charCodeAt(0) >= 97 && q.charCodeAt(0) <= 122)){
						break
					}
					
					//Castling, by sliding the rook next to the king
					if(i == A1 && this.board[target+E] == 'K' && this.wc[0]){
						yield [target+E, target+W]
					}
					if(i == H1 && this.board[target+W] == 'K' && this.wc[1]){
						yield [target+W, target+E]
					}
				}
			}
		}
	}
	
    rotate(){
        //Rotates the board, preserving enpassant
		var rotatedBoard = ''
		for(var i = this.board.length - 1; i >=0 ; i--){
			if(this.board[i] == this.board[i].toLowerCase()){
				rotatedBoard+=this.board[i].toUpperCase()
			}else{
				rotatedBoard+=this.board[i].toLowerCase()
			}
		}
        return new Position(
            rotatedBoard, -this.score, this.bc, this.wc,
            this.ep ? 119-this.ep : 0,
            this.kp ? 119-this.kp : 0)
	}
    nullmove(){
        //Rotates the board, preserving enpassant
		var rotatedBoard = ''
		for(var i = this.board.length - 1; i >=0 ; i--){
			if(this.board[i] == this.board[i].toLowerCase()){
				rotatedBoard+=this.board[i].toUpperCase()
			}else{
				rotatedBoard+=this.board[i].toLowerCase()
			}
		}
        return new Position(
            rotatedBoard, -this.score, this.bc, this.wc, 0, 0)
	}
    move(move){
		//console.log(move)
        var i = move[0], j = move[1]
        var p = this.board[i], q = this.board[j]
        // Copy variables and reset ep and kp
        var board = this.board
        var wc = this.wc, bc = this.bc, ep = 0, kp = 0
        var score = this.score + this.value(move)
        // Actual move
        board = board.slice(0, j)+board[i]+board.slice(j+1)
		board = board.slice(0, i)+'.'+board.slice(i+1)
        // Castling rights, we move the rook or capture the opponent's
        if(i == A1) {wc = [false, wc[1]]}
        if(i == H1) {wc = [wc[0], false]}
        if(j == A8) {bc = [bc[0], false]}
        if(j == H8) {bc = [false, bc[1]]}
        // Castling
        if(p == 'K'){
            wc = [false, false]
            if(Math.abs(j-i) == 2){
                kp = Math.floor((i+j)/2)
				var index = j<i ? A1 : H1
                board = board.slice(0, index)+'.'+board.slice(index+1)
				board = board.slice(0, kp)+'R'+board.slice(kp+1)
			}
		}
        // Pawn promotion, double move and en passant capture
        if(p == 'P'){
            if(A8 <= j && j <= H8){
                board = board.slice(0, j)+'Q'+board.slice(j+1)
			}
            if(j - i == 2*N){
                ep = i + N
			}
            if(j == this.ep){
                board = board.slice(0, j+S)+'.'+board.slice(j+S+1)
			}
		}
		//console.log(board)
        // We rotate the returned position, so it's ready for the next player
        return new Position(board, score, wc, bc, ep, kp).rotate()
	}
    value(move){
		var i = move[0], j = move[1]
        var p = this.board[i], q = this.board[j]
        // Actual move
        var score = pst[p][j] - pst[p][i]
        // Capture
        if(q.charCodeAt(0) >= 97 && q.charCodeAt(0) <= 122){
            score += pst[q.toUpperCase()][119-j]
		}
        // Castling check detection
        if(Math.abs(j-this.kp) < 2){
            score += pst['K'][119-j]
		}
        // Castling
        if(p == 'K' && Math.abs(i-j) == 2){
            score += pst['R'][Math.floor((i+j)/2)]
            score -= pst['R'][j < i ? A1 : H1]
		}
        // Special pawn stuff
        if(p == 'P'){
            if(A8 <= j && j <= H8){
                score += pst['Q'][j] - pst['P'][j]
			}
            if(j == this.ep){
                score += pst['P'][119-(j+S)]
			}
		}
        return score
	}
}

///////////////////////////////////////////////////////////////////////////////
// Search logic
///////////////////////////////////////////////////////////////////////////////

class Searcher{
    constructor(){
        this.tp_score = {}
        this.tp_move = {}
        this.hist = {}
        this.nodes = 0
	}
    bound(pos, gamma, depth, root){
        /*returns r where
                s(pos) <= r < gamma    if gamma > s(pos)
                gamma <= r <= s(pos)   if gamma <= s(pos)
		*/
        this.nodes += 1
		//console.log(pos)
        // Depth <= 0 is QSearch. Here any position is searched as deeply as is needed for
        // calmness, and from this point on there is no difference in behaviour depending on
        // depth, so there is no reason to keep different depths in the transposition table.
        depth = Math.max(depth, 0)

        // Sunfish is a king-capture engine, so we should always check if we
        // still have a king. Notice since this is the only termination check,
        // the remaining code has to be comfortable with being mated, stalemated
        // or able to capture the opponent king.
        if(pos.score <= -MATE_LOWER){
            return -MATE_UPPER
		}

        // We detect 3-fold captures by comparing against previously
        // _actually played_ positions.
        // Note that we need to do this before we look in the table, as the
        // position may have been previously reached with a different score.
        // This is what prevents a search instability.
        // FIXME: This is not true, since other positions will be affected by
        // the new values for all the drawn positions.
        if(DRAW_TEST){
            if(!root && this.hist[pos.toStr()]){
                return 0
			}
		}

        // Look in the table if we have already searched this position before.
        // We also need to be sure, that the stored search was over the same
        // nodes as the current search.
        var entry = {
			lower:-MATE_UPPER,
			upper:MATE_UPPER
		}
		if(this.tp_score[pos.toStr()+depth+root]){
			entry = this.tp_score[pos.toStr()+depth+root]
		}
		
		if(entry.lower >= gamma && (!root || this.tp_move[pos.toStr()])){
            //console.log('entry collision')
			return entry.lower
		}
        if(entry.upper < gamma){
            //console.log('entry collision')
			return entry.upper
		}
        // Here extensions may be added
        // Such as 'if in_check: depth += 1'
		// Generator of moves to search in order.
        // This allows us to define the moves, but only calculate them if needed.
        
        // Run through the moves, shortcutting when possible
        var best = -MATE_UPPER
		for(var move of this.moves(pos, gamma, depth, root)){
			best = Math.max(best, move[1])
            if(best >= gamma){
                // Clear before setting, so we always have a value
                //if(Object.keys(this.tp_move).length > TABLE_SIZE){
				//	this.tp_move = {}
				//	console.log('reseting tp_move')
				//}
                // Save the move for pv construction and killer heuristic
				//console.log(pos.toStr())
                this.tp_move[pos.toStr()] = move[0]
                break
			}
		}

        // Stalemate checking is a bit tricky: Say we failed low, because
        // we can't (legally) move and so the (real) score is -infty.
        // At the next depth we are allowed to just return r, -infty <= r < gamma,
        // which is normally fine.
        // However, what if gamma = -10 and we don't have any legal moves?
        // Then the score is actaully a draw and we should fail high!
        // Thus, if best < gamma and best < 0 we need to double check what we are doing.
        // This doesn't prevent sunfish from making a move that results in stalemate,
        // but only if depth == 1, so that's probably fair enough.
        // (Btw, at depth 1 we can also mate without realizing.)
        if(best < gamma && best < 0 && depth > 0){
            var is_dead = (p) => {
				for(var move of p.gen_moves()){
					if(p.value(move) >= MATE_LOWER){
						return true
					}
				}
				return false
			}
			var all_moves_dead = true
            for(var move of pos.gen_moves()){
				if(!is_dead(pos.move(move))){
					all_moves_dead = false
				}
			}
			//if in check, best is -MATE_UPPER
			if(all_moves_dead){
				best = is_dead(pos.nullmove()) ? -MATE_UPPER : 0
			}
		}
        // Clear before setting, so we always have a value
        //if(Object.keys(this.tp_score).length > TABLE_SIZE){
		//	this.tp_score = {}
		//}
        // Table part 2
        if(best >= gamma){
            this.tp_score[pos.toStr()+depth+root] = {
				lower:best, upper:entry.upper
			}
		}
        if(best < gamma){
            this.tp_score[pos.toStr()+depth+root] = {
				lower:entry.lower, upper:best
			}
		}

        return best
	}
	*moves(pos, gamma, depth, root){
		// First try not moving at all. We only do this if there is at least one major
		// piece left on the board, since otherwise zugzwangs are too dangerous.
		if(depth > 0 && !root && (pos.board.includes('R') || pos.board.includes('B') || pos.board.includes('N') || pos.board.includes('Q'))){
			yield [null, -this.bound(pos.nullmove(), 1-gamma, depth-3, false)]
		}
		// For QSearch we have a different kind of null-move, namely we can just stop
		// and not capture anything else.
		if(depth == 0){
			yield [null, pos.score]
		}
		// Then killer move. We search it twice, but the tp will fix things for us.
		// Note, we don't have to check for legality, since we've already done it
		// before. Also note that in QS the killer must be a capture, otherwise we
		// will be non deterministic.
		if(this.tp_move[pos.toStr()]){
			var killer = this.tp_move[pos.toStr()]
			//console.log(killer)
			if(depth > 0 || pos.value(killer) >= QS_LIMIT){
				yield [killer, -this.bound(pos.move(killer), 1-gamma, depth-1, false)]
			}
		}
		 
		
		// Then all the other moves
		var moves_uns = Array.from(pos.gen_moves())
		//console.log(moves_uns.length)
		var moves_s = moves_uns.sort((f,s) =>{
			return pos.value(s) - pos.value(f) 
		})
		for(var i = 0; i < moves_s.length; i++){
		//for val, move in sorted(((pos.value(move), move) for move in pos.gen_moves()), reverse=True):
			// If depth == 0 we only try moves with high intrinsic score (captures and
			// promotions). Otherwise we do all moves.
			//console.log(moves_s[i])
			if(depth > 0 || pos.value(moves_s[i]) >= QS_LIMIT){
				yield [moves_s[i], -this.bound(pos.move(moves_s[i]), 1-gamma, depth-1, false)]
			}
		}
		//console.log('foo')
	}
    *search(pos, hist){
        // Iterative deepening MTD-bi search
        this.nodes = 0
        if(DRAW_TEST){
            this.hist = {}
			for(var i = 0; i < hist.length; i++){
				this.hist[hist[i].toStr()] = hist[i]
			}
            // print('# Clearing table due to new history')
            this.tp_score = {}
		}
        // In finished games, we could potentially go far enough to cause a recursion
        // limit exception. Hence we bound the ply.
        for(var depth = 1; depth < 1000; depth++){
            // The inner loop is a binary search on the score of the position.
            // Inv: lower <= score <= upper
            // 'while lower != upper' would work, but play tests show a margin of 20 plays
            // better.
            var lower = -MATE_UPPER, upper = MATE_UPPER 
            while(lower < upper - EVAL_ROUGHNESS){
                var gamma = Math.floor((lower+upper+1)/2)
                var score = this.bound(pos, gamma, depth, true)
				
                if(score >= gamma){
                    lower = score
				}
                if(score < gamma){
                    upper = score
				}
			}
            // We want to make sure the move to play hasn't been kicked out of the table,
            // So we make another call that must always fail high and thus produce a move.
            this.bound(pos, lower, depth, true)
            // If the game hasn't finished we can retrieve our move from the
            // transposition table.
            yield [depth, this.tp_move[pos.toStr()], this.tp_score[pos.toStr()+depth+true].lower]
		}
	}
}
