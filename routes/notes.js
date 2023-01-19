const { json } = require('express');
var express = require('express');
var router = express.Router();

// middleware specific to this router
/*router.use(function timeLog(req, res, next) {
    console.log('Time: ', Date.now());
    next();
});*/

// define the home page route


router.post('/signin', express.urlencoded({ extended: true }),(req, res) => {
    
    var db = req.db;
    var user_col = db.get('userList');
    //console.log("SESSION", req.session.userId);
    console.log(req.body);
    var name = req.body.username;
	var pwd = req.body.password;
    console.log("name: ", name);
    console.log("pwd: ", pwd);
   
    
    user_col.find({'name':name}, function(error, login_user){
        const list = new Array();
        console.log(login_user);
        if(error === null){
            if((login_user.length>0)&&(login_user[0].password==pwd)){
                console.log("loggedin");
                req.session.userId = String(login_user[0]._id);
                var obj = {}
                obj["name"] = name;
                obj["icon"] = login_user[0].icon;
                list.push(obj);   
                //req.sessionID;
                
                console.log("sessionID2", req.session.userId);

                var note_col = db.get('noteList');
                //console.log(note_col);
                note_col.find({'userId': req.session.userId}).then((note)=>{
                    console.log("note", note);
                    if(error === null){
                        for (let i=0; i < note.length; i++){
                            var obj2 = {};
                            obj2["_id"] = note[i]._id;
                            obj2["lastsavedtime"] = note[i].lastsavedtime;
                            obj2["title"] = note[i].title;
                            obj2["content"] = note[i].content;
                            list.push(obj2);
                        }
                        console.log(list);
                        var jsonData = JSON.stringify(list);
                        console.log("JSONDATA", jsonData);
                        res.send(jsonData);
                    }else{res.send(error);}
                });
            }else{res.send("login error");}
        }else{res.send();}
    });   
});

router.get('/logout', function(req, res){
    console.log("logout",req.session.user);
    req.session.userId = null;
    res.send('');
});

router.get('/getnote', function(req, res){
    var db = req.db;
    var note_col = db.get('noteList');
    var noteid = req.query.noteid;
    console.log("sessoinID2", req.session.userId);
    //var noteid = localStorage.getItem(userId);
    console.log("NOTE",noteid);
    note_col.find({'_id': noteid}, function(error, note_list){
        console.log(note_list);
        if(error === null){
            var jsonData = JSON.stringify(note_list);
            res.send(jsonData);
        }else{res.send(error);}
    })
});

/*media_col.update({'_id': media_id}, {$set:{'url':the_media[0].url, 'userid':the_media[0].userid, 'likedby':like_list}}, function(error, result){
    if(error === null){
        res.send({'likedby':like_list});
    }
    else{
        res.send({msg:error});
    }
});*/

router.post('/addnote', function(req, res){
    var db = req.db;
    var note_col = db.get('noteList');
    //var title = req.body.title;
    //var content = req.body.content;
    let date = new Date();
    let hr = date.getHours();
    let min = date.getMinutes();
    let sec = date.getSeconds();
    
    //console.log("title", title);
    //console.log("content", content);
    //console.log("sessionid",req.session.Id);
    //var id = req.session.userId;
    //var id = userId;
    //console.log("id", id);
  
    note_col.insert({
        userId: req.session.userId,
        lastsavedtime: `${hr}:${min}:${sec} Tue Dec 13 2022`,
        title: req.body.title,
        content: req.body.content
    }, function(error, docs){
        if(error===null){
            console.log("newdocs", docs)
            res.send(JSON.stringify(docs));
        }else{(res.send(error))};
    });
    /*
    note_col.find({'userId': Id}, function(error, docs){
        console.log("docs", docs);
        if(error===null){
            console.log("sent!");
            res.send(JSON.stringify(docs));
        }else{res.send(error)}
    });*/

});

router.put('/updatenote/:noteid', function(req, res){
    var db = req.db;
    var note_col = db.get('noteList');
    var updateid = req.params.noteid;
    let date = new Date();
    let hr = date.getHours();
    let min = date.getMinutes();
    let sec = date.getSeconds();

    note_col.update({'_id': updateid}, {$set: {'lastsavedtime': `${hr}:${min}:${sec} Tue Dec 13 2022`, 'title': req.body.title, 'content': req.body.content}})
    .then((result) => {
        res.send(`${hr}:${min}:${sec} Tue Dec 13 2022`);
    })
    .catch((err)=>{
        res.send({msg:err});
    })

});

router.get('/searchnotes', function(req, res){
    var db = req.db;
    var note_col = db.get('noteList');
    var searchstr = req.query.searchstr;
    var list = new Array();
    console.log("searchstr", searchstr);
    console.log("sessionid", req.session.userId);
    note_col.find({'userId': req.session.userId}, function(error, result){
        console.log('result',result);
        if(error===null){
            console.log('result',result);
            for(let i=0; i<result.length; i++){
                console.log("#", i);
                var obj = new Object();
                var title = result[i].title;
                var content = result[i].content;
                if(title.includes(searchstr) || content.includes(searchstr)){
                    obj["_id"] = result[i]._id;
                    obj["lastsavedtime"] = result[i].lastsavedtime;
                    obj["title"] = result[i].title;
                    list.push(obj);
                }
            }
            console.log("searchlist", list);
            res.send(JSON.stringify(list));
        }else{res.send(error);}
    });
});

router.delete('/deletenote/:id', function(req, res){
    var db = req.db;
    var note_col = db.get('noteList');
    console.log("delete id", req.params.id);
    var idDelete = req.params.id;

    note_col.remove({'_id': idDelete}).then((result)=>{
        res.send({msg:""});
    })
    .catch((err)=>{
        res.send({msg:err});
    })
});

module.exports = router;