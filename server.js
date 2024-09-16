const express = require("express");
const mongoose = require("mongoose");
const axios = require("axios");
const path = require("path");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3000;

// Configurando o EJS como motor de views
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Configurar o Express para servir arquivos estáticos da pasta 'public'
app.use(express.static(path.join(__dirname, "public")));

// Conectar ao MongoDB
mongoose
  .connect(process.env.MONGO_URI, {})
  .then(() => console.log("Conectado ao MongoDB Atlas"))
  .catch((err) => console.error("Erro ao conectar ao MongoDB Atlas", err));

const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  dob: String,
  age: Number,
  picture: String,
});

const User = mongoose.model("User", userSchema);

// Rota para buscar e salvar usuários
app.get("/fetch-users", async (req, res) => {
  try {
    const response = await axios.get("https://randomuser.me/api/");
    const userData = response.data.results[0];
    const newUser = new User({
      name: `${userData.name.first} ${userData.name.last}`,
      email: userData.email,
      dob: userData.dob.date,
      age: userData.dob.age,
      picture: userData.picture.large,
    });
    await newUser.save();
    res.redirect("/");
  } catch (error) {
    console.error("Erro ao buscar usuários da API:", error);
    res.status(500).send("Erro ao buscar usuários da API");
  }
});

// Rota para exibir os usuários salvos
app.get("/", async (req, res) => {
  try {
    const users = await User.find();
    res.render("index", { users });
  } catch (error) {
    console.error("Erro ao buscar usuários do banco de dados:", error);
    res.status(500).send("Erro ao buscar usuários do banco de dados");
  }
});

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
