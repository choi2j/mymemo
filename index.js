const express = require('express')
const app = express()
const MongoClient = require('mongodb').MongoClient
const methodOverride = require('method-override')
app.use(methodOverride('_method'))

app.use(express.urlencoded({ extended: true }));

app.set('view engine', 'ejs');

app.use('/public', express.static('public'));

var db;
MongoClient.connect('mongodb+srv://admin:1234@mymemo.wpwmkyg.mongodb.net/?retryWrites=true&w=majority', { useUnifiedTopology: true }, function (err, client) {
	if (err) return console.log(err)

    db = client.db('mymemo');

	app.listen(8080, function () {
		console.log('listening on 8080')
	});
});

//여기 이하는 쓸데없는 app.get 이런 코드들

app.post('/add', (req,res) => {
    let date = new Date();
    let year = date.getFullYear();
    let month = date.getMonth()+1;
    let day = date.getDate();
    let hour = date.getHours();
    let minute = date.getMinutes();
    let memodate = `${year}-${month}-${day} ${hour}:${minute}`;

    db.collection('memocount').findOne({name: "memocount"}, (err, result) => {
        console.log(result.memocount)
        var memocount = result.memocount
        db.collection('memo').insertOne({_id: memocount + 1, title: req.body.title, content: req.body.content, date: memodate}, (err, result) => {
            db.collection('memocount').updateOne( {name : 'memocount' } , { $inc : { memocount : 1 } } , (err, result) => {
                if(err){return console.log(err)}
                console.log('post done.')
            })
            console.log('done.')
        })
    })
    res.redirect('/')
})

app.get('/write', (req,res) => {
    res.render('write.ejs')
})

app.delete('/delete', (req,res) => {
    req.body._id = parseInt(req.body._id)
    db.collection('memo').deleteOne(req.body, (err, result) => {
        console.log(req.body._id)
        console.log('delete done.')
    })
    res.redirect('/')
})

app.get('/edit/:_id', (req, res) => {
    db.collection('memo').findOne({ _id : parseInt(req.params._id) }, (err, result) => {
        console.log(req.body)
        res.render('edit.ejs', { memo : result })
    })
})

app.put('/edit', (req, res) => { 
    db.collection('memo').updateOne({ _id : parseInt(req.body.id) }, {$set : { title : req.body.title , content : req.body.content }}, () => {
        console.log('edit done.')
        res.redirect('/')
    })
})

app.get('/', (req, res) => { 
    db.collection('memo').find().toArray((err, result) => {
        console.log(result)
        res.render('index.ejs', { memo : result })
    })
})