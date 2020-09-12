const path = require("path");
const fs = require("fs");
const encoding = "utf8";

const express = require("express");
const app = express();

// allows Heroku to manage the port allocation
const PORT = process.env.PORT || 3000;


app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

const save_path = path.resolve(__dirname, "db");
const save_file = path.join(save_path, "db.json");


const file_data = fs.readFileSync(save_file, error => {
    if (error) throw error;
});

let saved_data = JSON.parse(file_data);

// Gets largest id in the saved data and adds 1 to create the next id to be used
let next_id = Math.max(...saved_data.map(note => note.id)) + 1;



app.get("/", function(req, res) {
    res.sendFile(path.join(__dirname, "public/index.html"));
});

app.get("/notes", function(req, res) {
    res.sendFile(path.join(__dirname, "public/notes.html"));
});



// Gets all saved notes
app.get("/api/notes", function(req, res) {
    return res.json(saved_data);
});

// Gets a specific note
app.get("/api/notes/:id", function(req, res) {
    const chosen = req.params.id;
    for (let i = 0; i < saved_data.length; i++) {
        if (chosen == saved_data[i].id) {
            return res.json(saved_data[i]);
        }
    }

    return res.json(false);
});

// Creates a new note
app.post("/api/notes", function(req, res) {
    const new_note = req.body;

    new_note.id = next_id;
    next_id += 1;

    saved_data.push(new_note);
    const saved_JSON = JSON.stringify(saved_data);
    fs.writeFile(save_file, saved_JSON, encoding, error => {
        if (error) throw error;
        console.log(`There was a note added:\n${JSON.stringify(new_note)}\n`);
    });
    res.json(new_note);
});

// Deletes a specific note
app.delete("/api/notes/:id", function(req, res) {
    const chosen = req.params.id;
    console.log(req.params);
    for (let i = 0; i < saved_data.length; i++) {
        if (chosen == saved_data[i].id) {
            const removed_note = saved_data.splice(i, 1);
            const saved_JSON = JSON.stringify(saved_data);
            fs.writeFile(save_file, saved_JSON, encoding, error => {
                if (error) throw error;
                console.log(`There was a deleted note:\n${JSON.stringify(removed_note)}\n`);
            });
            return res.json(saved_data);
        }
    }

    return res.json(false);
});



// If a non-valid url is attempted
app.get("*", function(req, res) {
    console.log(req.path);
    res.sendFile(path.join(__dirname, "public/index.html"));
});

// Starts the server to begin listening
// =============================================================
app.listen(PORT, function() {
    console.log("App listening on PORT " + PORT);
});
