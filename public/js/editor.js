document.addEventListener("DOMContentLoaded", () => {

const folderSelect = document.getElementById("folderSelect");
const fileSelect = document.getElementById("fileSelect");

const loadBtn = document.getElementById("loadBtn");
const loadFileBtn = document.getElementById("loadFileBtn");
const loadProjectBtn = document.getElementById("loadProjectBtn");

const deleteBtn = document.getElementById("deleteBtn");
const archiveBtn = document.getElementById("archiveBtn");
const saveBtn = document.getElementById("saveBtn");

const newFolderBtn = document.getElementById("newFolderBtn");
const newFileBtn = document.getElementById("newFileBtn");

let editorHtml, editorCss, editorJs;
let currentFolder = "";
let currentProjectFiles = { html: null, css: null, js: null };

require.config({
  paths: { vs: "https://unpkg.com/monaco-editor@0.45.0/min/vs" }
});

require(["vs/editor/editor.main"], function () {

  editorHtml = monaco.editor.create(document.getElementById("editorHtml"), {
    value: "",
    language: "html",
    theme: "vs-dark",
    automaticLayout: true
  });

  editorCss = monaco.editor.create(document.getElementById("editorCss"), {
    value: "",
    language: "css",
    theme: "vs-dark",
    automaticLayout: true
  });

  editorJs = monaco.editor.create(document.getElementById("editorJs"), {
    value: "",
    language: "javascript",
    theme: "vs-dark",
    automaticLayout: true
  });

  loadFolders();
});


// =====================
// LOAD FOLDERS
// =====================
async function loadFolders() {
  const res = await fetch("/api/folders");
  const folders = await res.json();

  folderSelect.innerHTML = '<option value="">(public)</option>';

  folders.forEach(f => {
    const opt = document.createElement("option");
    opt.value = f;
    opt.textContent = f;
    folderSelect.appendChild(opt);
  });

  currentFolder = folderSelect.value;
  loadFiles();
}

folderSelect.onchange = () => {
  currentFolder = folderSelect.value;
  loadFiles();
};


// =====================
// LOAD FILES
// =====================
async function loadFiles() {
  const res = await fetch("/api/files?folder=" + currentFolder);
  const files = await res.json();

  fileSelect.innerHTML = "";

  files.forEach(f => {
    const opt = document.createElement("option");
    opt.value = f;
    opt.textContent = f;
    fileSelect.appendChild(opt);
  });
}


// =====================
// LOAD SELECTED FILE
// =====================
async function loadSelectedFile() {

  const file = fileSelect.value;
  if (!file) return;

  const res = await fetch(`/api/getfile?folder=${currentFolder}&file=${file}`);
  const content = await res.text();

  if (file.endsWith(".html")) {
    editorHtml.setValue(content);
    currentProjectFiles.html = file;
    document.getElementById("htmlName").textContent = file;
  }

  if (file.endsWith(".css")) {
    editorCss.setValue(content);
    currentProjectFiles.css = file;
    document.getElementById("cssName").textContent = file;
  }

  if (file.endsWith(".js")) {
    editorJs.setValue(content);
    currentProjectFiles.js = file;
    document.getElementById("jsName").textContent = file;
  }
}


// =====================
// LOAD WHOLE PROJECT
// =====================
async function loadWholeProject() {

  const res = await fetch("/api/files?folder=" + currentFolder);
  const files = await res.json();

  for (const file of files) {

    const r = await fetch(`/api/getfile?folder=${currentFolder}&file=${file}`);
    const content = await r.text();

    if (file.endsWith(".html")) {
      editorHtml.setValue(content);
      currentProjectFiles.html = file;
      document.getElementById("htmlName").textContent = file;
    }

    if (file.endsWith(".css")) {
      editorCss.setValue(content);
      currentProjectFiles.css = file;
      document.getElementById("cssName").textContent = file;
    }

    if (file.endsWith(".js")) {
      editorJs.setValue(content);
      currentProjectFiles.js = file;
      document.getElementById("jsName").textContent = file;
    }
  }
}


// =====================
// SAVE FILE
// =====================
async function saveCurrentFile(type) {

  let file = currentProjectFiles[type];
  if (!file) return alert("Brak pliku");

  let content = "";

  if (type === "html") content = editorHtml.getValue();
  if (type === "css") content = editorCss.getValue();
  if (type === "js") content = editorJs.getValue();

  await fetch("/api/savefile", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      folder: currentFolder,
      file,
      content
    })
  });

  alert("Zapisano");
}


// =====================
// DELETE FILE
// =====================
deleteBtn.onclick = async () => {

  const file = fileSelect.value;
  if (!file) return;

  await fetch("/api/delete", {
    method: "POST",
    headers: {"Content-Type":"application/json"},
    body: JSON.stringify({ folder: currentFolder, file })
  });

  loadFiles();
};


// =====================
// ARCHIVE FILE
// =====================
archiveBtn.onclick = async () => {

  const file = fileSelect.value;
  if (!file) return;

  await fetch("/api/archive", {
    method: "POST",
    headers: {"Content-Type":"application/json"},
    body: JSON.stringify({ folder: currentFolder, file })
  });

  loadFiles();
};


// =====================
// NOWY PROJEKT
// =====================
if (newFolderBtn) {
newFolderBtn.onclick = async () => {

  const name = prompt("Nazwa projektu:");
  if (!name) return;

  await fetch("/api/createfolder", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ folder: name })
  });

  await loadFolders();
  folderSelect.value = name;
  currentFolder = name;
  loadFiles();
};
}


// =====================
// NOWY PLIK
// =====================
if (newFileBtn) {
newFileBtn.onclick = async () => {

  if (!currentFolder) {
    alert("Najpierw wybierz projekt");
    return;
  }

  const name = prompt("Nazwa pliku:");
  if (!name) return;

  await fetch("/api/createfile", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      folder: currentFolder,
      file: name
    })
  });

  loadFiles();
};
}


// =====================
// BUTTON EVENTS
// =====================
loadBtn.onclick = loadSelectedFile;
loadFileBtn.onclick = loadSelectedFile;
loadProjectBtn.onclick = loadWholeProject;

saveBtn.onclick = async () => {
  await saveCurrentFile("html");
  await saveCurrentFile("css");
  await saveCurrentFile("js");
};


// =====================
// PREVIEW
// =====================
window.preview = function () {

  const html = editorHtml.getValue();
  const css = `<style>${editorCss.getValue()}</style>`;
  const js = `<script>${editorJs.getValue()}<\/script>`;

  const frame = document.getElementById("previewFrame");
  frame.srcdoc = html + css + js;
};

});
