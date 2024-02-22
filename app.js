//carregar as variáveis de ambiente do arquivo .env
require('dotenv').config();

//importando o pacote Express
const express = require('express');

//importando o pacote ExpressLayouts
const expressLayouts = require('express-ejs-layouts');

const connectDB = require('./server/config/db');
const session = require('express-session');
const passport = require('passport');
const MongoStore = require('connect-mongo');


//aplicativo express
const app = express();
const port = 7000 || process.env.PORT;

app.use(passport.initialize());
//app.use(passport.session());

app.use(express.urlencoded({extended: true}));
app.use(express.json());

//Connect to Database
connectDB();

//o Express irá procurar arquivos ESTÁTICOS dentro do diretório "public"
app.use(express.static('public'));

//definição de layout padrão
app.use(expressLayouts);
app.set('layout', './layouts/main');
app.set('view engine', 'ejs');

//Routes
app.use('/', require('./server/routes/auth'));
app.use('/', require('./server/routes/index'));
app.use('/', require('./server/routes/dashboard'));

//Handle 404
app.get('*', function(req, res) {
    //res.status(404).send('404 Pagina Não Encontrada.')//mensagem sem personalização
    res.status(404).render('404');
})

//inicia o servidor Express para ouvir as solicitações HTTP em uma porta específica
app.listen(port, () => {
    console.log(`App iniciado na porta ${port}`);
})