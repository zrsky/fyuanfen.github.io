/**
 * Created by zyy on 2017/3/15.
 */
// var fs = require("fs");
// var options = {
//     key: fs.readFileSync('./2_node.redream.cn.key'),
//     cert: fs.readFileSync('./1_node.redream.cn_cert.crt')
// };
var app = require('express')();
// var https = require('https').Server(options,app);
var http = require('http').Server(app);
var io = require('socket.io')(http);

app.get('/', function(req, res){
    res.send('<h1>Welcome Realtime Server</h1>');
});

// app.get('/', function(req, res){
//     res.sendFile(__dirname + '/index.html');
// });


//在线用户
var onlineUsers = {};//{id:{obj},id:{obj2}}
//当前在线人数
var onlineCount = 0;

var msgid = 1;
io.on('connection', function(socket){
    console.log('a user connected');

    //监听新用户加入
    socket.on('login', function(obj){
        //将新加入用户的唯一标识当作socket的名称，后面退出的时候会用到
        socket.name = obj.userid;
         console.log(obj.userid)
        //检查在线列表，如果不在里面就加入
        if(!onlineUsers.hasOwnProperty(obj.userid)) {
            onlineUsers[obj.userid] = obj;
            //在线人数+1
            onlineCount++;
        //向所有客户端广播用户加入
        io.emit('login', {onlineUsers:onlineUsers, onlineCount:onlineCount, user:obj,login:true});
        console.log(obj.username+'加入了聊天室');
        }
    });

    //监听用户退出
    socket.on('disconnect', function(){
        //将退出的用户从在线列表中删除
        if(onlineUsers.hasOwnProperty(socket.name)) {

            //退出用户的信息
            var obj = onlineUsers[socket.name];

            console.log(socket.name+'退出了聊天室');
            //删除
            delete onlineUsers[socket.name];
            //在线人数-1
            onlineCount--;

            //向所有客户端广播用户退出
            io.emit('logout', {onlineUsers:onlineUsers, onlineCount:onlineCount, user:obj,logout:true});

        }
    });

    //监听用户发布聊天内容
    socket.on('message', function(obj){
        //向所有客户端广播发布的消息
        io.emit('message', {user:obj,msg:obj.msg});
        //信息格式为{user:{username,userid,color},msg,onlineCount,onlineUsers,login,logout}
        console.log(obj.username+'说：'+obj.msg);
    });

});

http.listen(3000, function(){
    console.log('listening on *:3000');
});
// https.createServer(options).listen(3000, function () {
//     console.log('Https server listening on port ' + 3000);
// });
// https.createServer(options,function(req,res){
// 	res.writeHead(200);
// 	res.end('hello world\n');
// }).listen(3000,'127.0.0.1');
