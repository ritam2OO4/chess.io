const socket = io();
const chess = new Chess();
const chessBoard = document.querySelector('.chessboard');
let playerRole = null;
let draggedPeice = null;
let sourceSquare = null;

const renderBoard = () => {
    const board = chess.board()
    chessBoard.innerHTML = ''
    board.forEach((row, rowIndex) => {
        row.forEach((square, squareIndex) => {
            const squarePeice = document.createElement('div')
            squarePeice.classList.add('square',
                (rowIndex + squareIndex) % 2 === 0 ? 'light' : 'dark')

            squarePeice.dataset.row = rowIndex
            squarePeice.dataset.col = squareIndex

            if (square) {
                const peiceElement = document.createElement('div')
                peiceElement.classList.add('peice',
                    (square.color === 'w' ? 'white' : 'black'))
                peiceElement.innerText = getPeiceUnicode(square)
                peiceElement.draggable = playerRole === square.color;         // dtaggable is a html/css property which set to be true or false

                peiceElement.addEventListener('dragstart', (e) => {
                    if (peiceElement.draggable) {
                        draggedPeice = peiceElement;
                        sourceSquare = { row: rowIndex, col: squareIndex }
                        e.dataTransfer.setData('text/plain', '')
                    }
                })
                peiceElement.addEventListener('dragend', (e) => {
                    draggedPeice = null;
                    sourceSquare = null;
                })
                squarePeice.appendChild(peiceElement)
            }
            squarePeice.addEventListener('dragover', (e) => {
                e.preventDefault();
            })
            squarePeice.addEventListener('drop', (e) => {
                e.preventDefault();
                if (draggedPeice) {
                    const targetSquare = {
                        row: parseInt(squarePeice.dataset.row),
                        col: parseInt(squarePeice.dataset.col)
                    }
                    handleMove(sourceSquare, targetSquare)
                }
            })
            chessBoard.appendChild(squarePeice)

        })
    });
    if(playerRole == 'b') chessBoard.classList.add('flipped');
    else chessBoard.classList.remove('flipped')
}
const handleMove = (source, target) => {
    const move = {
        from: `${String.fromCharCode(97 + source.col)}${8 - source.row}`,
        to: `${String.fromCharCode(97 + target.col)}${8 - target.row}`,
        promotion: 'q',
    }

    socket.emit('move', move)
}

const getPeiceUnicode = (peice) => {
    const PeiceUnicode = {

        r: '♜',
        n: '♞',
        b: '♝',
        q: '♛',
        k: '♚',

        p: '♙',

        // P: '♟',

        R: '♖',
        N: '♘',
        b: '♗',
        Q: '♕',
        K: '♔'
    }
    return PeiceUnicode[peice.type] || ''
}

socket.on('playerRole', function (role) {
    playerRole = role;
    renderBoard();

})
socket.on('spectatorRole', function () {
    playerRole = null;
    renderBoard();

})
socket.on('move', function (move) {
    chess.move(move);
    renderBoard();

})
socket.on('boardState', function (fen) {
    chess.load(fen);
    renderBoard();
    
})
renderBoard();
