const express = require('express');

const app = express();
const bodyParser = require('body-parser');

app.set('view engine', 'ejs');
app.set('views');
app.use(bodyParser.urlencoded({ extended: true }));

app.get('/', (req, res) => {
  res.render('index');
});

app.post('/login', (req, res) => {
  console.log(req.body.username, req.body.password);
  res.send('success');
});

app.get('/')

app.post('/register',(req,res)=>{
  res.r
});

app.listen(3000, () =>{
  console.log('listening at port 3000...');
});

