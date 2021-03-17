const fs = require("fs");
const express = require("express");
const cors = require('cors');
const multer = require("multer");

const app = express();

app.use(cors())
app.use(express.json());

const getAge = birthDate => new Date(
  (Date.now() - Date.parse(birthDate))
).getFullYear() - 1970

const readUsers = () => JSON.parse(fs.readFileSync("./user.json").toString()).map(user => ({
  ...user,
  age: getAge(user.birthDate)
}));

const upload = multer({
  dest: './uploads',
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = ["image/jpeg", "image/jpg", "image/png"];
    if (!allowedTypes.includes(file.mimetype)) {
      const error = new Error("Mauvais fichier");
      error.code = "INCORRECT_FILETYPE";
      // error occured
      return cb(error, false)
    }
    // nothing went wrong 
    cb(null, true);
}

app.use((err, req, res, next) => {
  if (err.code === "INCORRECT_FILETYPE") {
    res.status(422).json({ error: 'Only images are allowed'});
    return;
  }
});

app.post('/upload', upload.single('avatar'), function (req, res, next) {
  res.json({ file :req.file});
  console.log(req.file);
  // req.file is the `avatar` file
  // req.body will hold the text fields, if there were any
})

app.get("/users", (req, res) => {
  res.json(readUsers());
});

app.post("/users", (req, res) => {
  const body = req.body;
  // Récupère la liste des users

  const users = readUsers();

      // Création du nouveau user
  const newUser = {
    id: Math.max(...users.map((user) => user.id)) + 1,
    lastName: body.lastName.toUpperCase(),
    firstName: body.firstName,
    email: body.email,
    birthDate: body.birthDate,
    avatarUrl: body.avatarUrl,
    gender: body.gender,
  };
  // Ajoute le nouveau user dans le tableau d'users
  users.push(newUser);
  // Ecris dans le fichier pour insérer la liste des users
  fs.writeFileSync("./user.json", JSON.stringify(users, null, 4));
  res.json(users);

});

app.put("/users/:id", (req, res) => {
  const body = req.body;

  // Récupère la liste des users
  const users = readUsers();

  // Création du nouveau user
  
  if (users.filter((user) => user.email === body.email)) {
    return res.json({ErrorEmail: 'Cet email existe déjà'})
  } else {
    const id = Number(req.params.id);
  const newUser = {
    id: id,
    lastName: body.lastName.toUpperCase(),
    firstName: body.firstName,
    email: body.email,
    birthDate: body.birthDate,
    avatarUrl: body.avatarUrl,
    gender: body.gender,
  };
  // Ajoute le nouveau user dans le tableau d'users
  const newUsers = [...users.filter((user) => user.id !== id), newUser];
  // Ecris dans le fichier pour insérer la liste des users
  fs.writeFileSync("./user.json", JSON.stringify(newUsers, null, 4));
  res.json(newUser);
  }    
  
});

app.delete("/users/:id", (req, res) => {

  // Récupère la liste des users
  const users = readUsers();

  // récupération de l'id du user via la route
  const id = Number(req.params.id);

  // Ajoute le nouveau user dans le tableau d'users
  const deleted = users.filter((user) => user.id !== id);
  // Ecris dans le fichier pour supprimer le users
  fs.writeFileSync("./user.json", JSON.stringify(deleted, null, 4));
  res.json(deleted);
});

app.get("/users/:id", (req, res) => {
  const body = req.body;

  // Récupère la liste des users
  const users = readUsers();
  const user = users.find((user) => user.id === Number(req.params.id));

  res.json(user);
});

app.listen(6929, () => console.log("server is running"));
