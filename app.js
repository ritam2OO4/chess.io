const express = require('express')
const path = require('path')
const socket = require('socket.io')
const http = require('http')
const { Chess } = require('chess.js')
const app = express()
const server = http.createServer(app)

const io = socket(server)


app.set('view engine', 'ejs')
app.use(express.static(path.join(__dirname, 'public')))

const chess = new Chess();
const players = {};
let currentPlayer = 'w'


io.on('connection', function (uniqueSocket) {
    try {
        if (!players.white) {
            players.white = uniqueSocket.id;
            uniqueSocket.emit('playerRole', 'w')
        }
        else if (!players.black) {
            players.black = uniqueSocket.id;
            uniqueSocket.emit('playerRole', 'b')
        }
        else {
            uniqueSocket.emit('spectatorRole')
        }
        uniqueSocket.on('disconnect', function () {
            if (uniqueSocket.id === players.white) {
                delete players.white;
            }
            else if (uniqueSocket.id === players.black) {
                delete players.white;
            }
        })
            try{
               uniqueSocket.on('move',function(move){
                if(chess.turn() == 'w' && uniqueSocket.id !== players.white ) return ;
                if(chess.turn() == 'b' && uniqueSocket.id !== players.black ) return ;

              const result = chess.move(move)
              if(result){
                currentPlayer = chess.turn()
                io.emit('move',move)
                io.emit('boardState' , chess.fen())
              }
              else{
                console.log('Invalid move : ',move);
                uniqueSocket.emit('InvalidMove',move);
            }
            
        })
    }
    catch(err){
                uniqueSocket.emit('InvalidMove',move);
                console.log(err.message)
            }
    }
    catch (err) {
        console.log(err.message)
    }
})

app.get('/', (req, res) => {
    res.render('index');
})

server.listen(3000)