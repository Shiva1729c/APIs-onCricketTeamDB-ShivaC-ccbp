const express = require("express");
const app = express();

app.use(express.json());

const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const path = require("path");

const dbPath = path.join(__dirname, "cricketTeam.db");

let db = null;

const initializeDbAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server is Running at http://localhost:3000/");
    });
  } catch (e) {
    console.log(`Db Error ${e.message}`);
    promise.exit(1);
  }
};

initializeDbAndServer();

const convertDBObjectToResponseObject = (dbObject) => {
  return {
    playerName: dbObject.player_name,
    playerId: dbObject.player_id,
    jerseyNumber: dbObject.jersey_number,
    role: dbObject.role,
  };
};

// API1 GET All players from cricket_team table

app.get("/players/", async (request, response) => {
  const getAllPlayersQuery = `
    SELECT * FROM cricket_team 
    `;
  const playersArray = await db.all(getAllPlayersQuery);
  response.send(
    playersArray.map((eachPlayer) =>
      convertDBObjectToResponseObject(eachPlayer)
    )
  );
});

// API2 POST a player into cricket_team table

app.post("/players/", async (request, response) => {
  const playerDetails = request.body;
  const { playerName, jerseyNumber, role } = playerDetails;
  const addPlayerQuery = `
    INSERT INTO cricket_team(player_name,jersey_number,role)
    VALUES(
        '${playerName}',
        ${jerseyNumber},
        '${role}'
    ) 
    `;
  const dbResponse = await db.run(addPlayerQuery);
  const playerId = dbResponse.lastID;
  response.send("Player Added to Team");
});

//  API3 GET a player from cricket_team table based on player_id

app.get("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const getPlayerQuery = `
    SELECT * FROM cricket_team WHERE player_id = ${playerId}
    `;
  const player = await db.get(getPlayerQuery);
  response.send(convertDBObjectToResponseObject(player));
});

// API4 PUT(update) a player into cricket_team table

app.put("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const playerDetails = request.body;
  const { playerName, jerseyNumber, role } = playerDetails;

  const updatePlayerQuery = `
   UPDATE cricket_team 
   SET 
   player_name ='${playerName}',
   jersey_number = ${jerseyNumber},
   role = '${role}'
   WHERE player_id = ${playerId}
   
   `;
  const player = await db.run(updatePlayerQuery);
  response.send("Player Details Updated");
});

//API5  DELETE a player from cricket_team table

app.delete("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;

  const deletePlayerQuery = `
    DELETE FROM cricket_team WHERE player_id = ${playerId}
    `;

  const result = await db.run(deletePlayerQuery);
  response.send("Player Removed");
});

module.exports = app;
