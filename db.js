// A tiny file-based database. Everything is stored in data.json.
const fs = require("fs");
const path = require("path");

const FILE = path.join(__dirname, "data.json");

const read = () => JSON.parse(fs.readFileSync(FILE, "utf8"));
const write = (data) => fs.writeFileSync(FILE, JSON.stringify(data, null, 2));

module.exports = { read, write };
