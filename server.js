const express = require("express");
const fs = require("fs");
const path = require("path");

const app = express();
app.use(express.json());
app.use(express.static("public"));
//
const BASE_DIR = path.join(__dirname, "public");
const ARCHIVE_DIR = path.join(__dirname, "archive");

if (!fs.existsSync(ARCHIVE_DIR)) {
    fs.mkdirSync(ARCHIVE_DIR);
}


// ===========================
// LISTA FOLDERÓW
// ===========================
app.get("/api/folders", (req, res) => {
    const items = fs.readdirSync(BASE_DIR, { withFileTypes: true });

    const folders = items
        .filter(item => item.isDirectory())
        .map(item => item.name);

    res.json(folders);
});


// ===========================
// LISTA PLIKÓW
// ===========================
app.get("/api/files", (req, res) => {
    const folder = req.query.folder || "";
    const dirPath = path.join(BASE_DIR, folder);

    if (!fs.existsSync(dirPath)) {
        return res.json([]);
    }

    const items = fs.readdirSync(dirPath, { withFileTypes: true });

    const files = items
        .filter(item => item.isFile())
        .map(item => item.name);

    res.json(files);
});


// ===========================
// WCZYTAJ PLIK
// ===========================
app.get("/api/getfile", (req, res) => {
    const { folder, file } = req.query;
    const filePath = path.join(BASE_DIR, folder || "", file);

    if (!fs.existsSync(filePath)) {
        return res.status(404).send("Brak pliku");
    }

    const content = fs.readFileSync(filePath, "utf-8");
    res.send(content);
});


// ===========================
// ZAPISZ PLIK
// ===========================
app.post("/api/savefile", (req, res) => {
    const { folder, file, content } = req.body;

    if (!file) return res.json({ error: "Brak pliku" });

    const filePath = path.join(BASE_DIR, folder || "", file);

    fs.writeFileSync(filePath, content || "");
    res.json({ status: "ok" });
});


// ===========================
// UTWÓRZ FOLDER
// ===========================
app.post("/api/createfolder", (req, res) => {
    const { folder } = req.body;
    if (!folder) return res.status(400).json({ error: "Brak nazwy" });

    const dirPath = path.join(BASE_DIR, folder);

    if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
    }

    res.json({ status: "created" });
});


// ===========================
// UTWÓRZ PLIK
// ===========================
app.post("/api/createfile", (req, res) => {
    const { folder, file } = req.body;
    if (!file) return res.status(400).json({ error: "Brak pliku" });

    const dirPath = path.join(BASE_DIR, folder || "");
    const filePath = path.join(dirPath, file);

    if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
    }

    if (!fs.existsSync(filePath)) {
        fs.writeFileSync(filePath, "");
    }

    res.json({ status: "created" });
});


// ===========================
// USUŃ PLIK
// ===========================
app.post("/api/delete", (req, res) => {
    const { folder, file } = req.body;
    const filePath = path.join(BASE_DIR, folder || "", file);

    if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
    }

    res.json({ status: "deleted" });
});


// ===========================
// ARCHIWIZUJ PLIK
// ===========================
app.post("/api/archive", (req, res) => {
    const { folder, file } = req.body;
    const filePath = path.join(BASE_DIR, folder || "", file);

    if (!fs.existsSync(filePath)) {
        return res.json({ status: "not found" });
    }

    const archiveFolder = path.join(ARCHIVE_DIR, folder || "");

    if (!fs.existsSync(archiveFolder)) {
        fs.mkdirSync(archiveFolder, { recursive: true });
    }

    const archivePath = path.join(archiveFolder, file);

    fs.renameSync(filePath, archivePath);

    res.json({ status: "archived" });
});


app.listen(3000, () => {
    console.log("Serwer działa na http://localhost:3000");
});
