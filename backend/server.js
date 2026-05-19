"use strict";

// Delegate to the new modular server entry point.
// This ensures that nodemon processes running the old entry point (server.js)
// automatically reload and execute the new modular structure in src/.
require("./src/server.js");
