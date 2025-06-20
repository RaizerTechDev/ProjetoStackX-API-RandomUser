const express = require("express");
const mongoose = require("mongoose");
const axios = require("axios");
const session = require("express-session");
const path = require("path");
const logger = require("./utils/logger");

const app = express();

// Middleware para lidar com erros globais
app.use((err, req, res, next) => {
  logger.error(err.stack); // Logar o erro
  res.status(500).send("Algo deu errado!"); // Responder com erro genérico
});

const PORT = process.env.PORT || 3000;

require("dotenv").config();

mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 5000
})
.then(() => console.log("✅ Conexão com MongoDB estabelecida!"))
.catch(err => {
  console.error("❌ Falha na conexão com MongoDB:", err.message);
  process.exit(1);
});

const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  dob: String,
  age: Number,
  picture: String,
});

const User = mongoose.model("User", userSchema);

// Configuração da view engine EJS
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Servir arquivos estáticos como CSS, JS, etc.
app.use(express.static(path.join(__dirname, "../public")));

// Configurar o middleware de sessão
app.use(
  session({
    secret: "seu-segredo-aqui",
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false },
  })
);

// Middleware para parsear JSON e URL-encoded
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rota para exibir os usuários salvos
app.get("/", async (req, res) => {
  try {
    const users = await User.find();
    const alertMessage = req.session.alertMessage || null;
    req.session.alertMessage = null;
    res.render("index", { users, alertMessage });
  } catch (error) {
   logger.error("Erro ao buscar usuários do banco de dados:", error);
    res.status(500).send("Erro ao buscar usuários do banco de dados");
  }
});


// Rota para buscar e adicionar usuários
app.get("/fetch-users", async (req, res) => {
  console.log("✅ Rota /fetch-users foi acessada");
  try {
      console.log("Fazendo requisição para randomuser.me...");
      const response = await axios.get("https://randomuser.me/api/");
      
      console.log("Dados recebidos da API:", response.data.results[0]);
      
      const userData = response.data.results[0];
      
      if (!userData) {
          throw new Error("Nenhum usuário retornado pela API");
      }

      const newUser = new User({
          name: `${userData.name.first} ${userData.name.last}`,
          email: userData.email,
          dob: userData.dob.date,
          age: userData.dob.age,
          picture: userData.picture.large,
      });

      await newUser.save();
      console.log("Usuário salvo no MongoDB:", newUser);
      
      req.session.alertMessage = "Usuário adicionado com sucesso!";
      return res.redirect("/");
      
  } catch (error) {
      console.error("Erro completo:", {
          message: error.message,
          stack: error.stack,
          response: error.response?.data
      });
      
      req.session.alertMessage = "Erro ao adicionar usuário: " + error.message;
      return res.redirect("/");
  }
});

// Rota para deletar usuários selecionados
app.post("/delete-users", async (req, res) => {   
  try {
    const userIds = req.body.userIds;
    const users = await User.find(); // Buscando usuários para verificar se há algum

    if (users.length === 0) {
      req.session.alertMessage = "Não existem usuários na lista!";
      return res.redirect("/");
    }

    if (!userIds) {
      req.session.alertMessage =
        "Escolha o usuário(a) da lista para deletar. 🙌👇";
      return res.redirect("/");
    }

    const idsToDelete = Array.isArray(userIds) ? userIds : [userIds];
    const usersToDelete = await User.find({ _id: { $in: idsToDelete } });

    // Logando informações de cada usuário que será deletado
    usersToDelete.forEach(user => {
      console.log(`Usuário deletado: ID = ${user._id}, Nome = ${user.name}`);
    });

    const result = await User.deleteMany({ _id: { $in: idsToDelete } });
    req.session.alertMessage = `${result.deletedCount} usuário(s) deletado(s) com sucesso!`;
    res.redirect("/");
  } catch (error) {
    logger.error("Erro ao deletar usuários:", error);
    res.status(500).send("Erro ao deletar usuários");
  }
});

// Inicia o servidor
module.exports = app;

// Ou para Vercel:
if (process.env.VERCEL) {
  module.exports = app;
} else {
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}