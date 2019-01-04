const fs = require('fs');
var path = require('path');
const readline = require('readline');
const {google} = require('googleapis');
const NodeID3 = require('node-id3');
const elasticsearch = require('elasticsearch');
var express = require('express');
var app = express();
var bodyParser = require('body-parser');
app.use(express.static('public'));
app.use(bodyParser.json());
var d = new Date();
const user = {};

var client = new elasticsearch.Client({
  hosts: [ 'http://localhost:9200']
});

// If modifying these scopes, delete token.json.
const SCOPES = ['https://www.googleapis.com/auth/drive.readonly','https://www.googleapis.com/auth/drive'];
const TOKEN_PATH = 'token.json';

// Load client secrets from a local file.
fs.readFile('credentials.json', (err, content) => {
  if (err) return console.log('Error loading client secret file:', err);
  // Authorize a client with credentials, then call the Google Drive API.
  authorize(JSON.parse(content), listFiles);
});

/**
 * Create an OAuth2 client with the given credentials, and then execute the
 * given callback function.
 * @param {Object} credentials The authorization client credentials.
 * @param {function} callback The callback to call with the authorized client.
 */
function authorize(credentials, callback) {
  const {client_secret, client_id, redirect_uris} = credentials.installed;
  const oAuth2Client = new google.auth.OAuth2(
      client_id, client_secret, redirect_uris[0]);

  // Check if we have previously stored a token.
  fs.readFile(TOKEN_PATH, (err, token) => {
    if (err) return getAccessToken(oAuth2Client, callback);
    oAuth2Client.setCredentials(JSON.parse(token));
    callback(oAuth2Client);
  });
}

/**
 * Get and store new token after prompting for user authorization, and then
 * execute the given callback with the authorized OAuth2 client.
 * @param {google.auth.OAuth2} oAuth2Client The OAuth2 client to get token for.
 * @param {getEventsCallback} callback The callback for the authorized client.
 */
function getAccessToken(oAuth2Client, callback) {
  const authUrl = oAuth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
  });
  console.log('Authorize this app by visiting this url:', authUrl);
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  rl.question('Enter the code from that page here: ', (code) => {
    rl.close();
    oAuth2Client.getToken(code, (err, token) => {
      if (err) return console.error('Error retrieving access token', err);
      oAuth2Client.setCredentials(token);
      // Store the token to disk for later program executions
      fs.writeFile(TOKEN_PATH, JSON.stringify(token), (err) => {
        if (err) console.error(err);
        console.log('Token stored to', TOKEN_PATH);
      });
      callback(oAuth2Client);
    });
  });
}

/**
 * Lists the names and IDs of up to 10 files.
 * @param {google.auth.OAuth2} auth An authorized OAuth2 client.
 */
function listFiles(auth) {
  const drive = google.drive({version: 'v3', auth});    
  /*client.ping({
      requestTimeout: 30000,
  }, function(error) {
      if (error) {
          console.error('elasticsearch cluster is down!');
      } else {
          console.log('Everything is ok');
      }
  });*/

  //getting some user data
  drive.about.get({
    fields: 'user'
  },(error, result) => {
    if (error) return console.log('The API returned an error: ' + error);
    console.log(result.data.user);
    user.name = result.data.user.displayName;
    user.email = result.data.user.emailAddress;
  });

  /*client.indices.create({
    index: 'song'
  }, function(err, resp, status) {
      if (err) {
          console.log(err);
      } else {
          console.log("create", resp);
      }
  });*/

  var nextPageToken = '';
  console.log('download began at ' + d.toISOString().slice(0,20));
  getNextFile(drive,nextPageToken);
}

function getNextFile(drive,nextPageToken)
{  
  if (typeof(nextPageToken) !== "undefined")
  {
    drive.files.list({
      pageSize: 10,
      fields: 'nextPageToken, files(id, name, kind, folderColorRgb, fileExtension, mimeType, parents, webContentLink)',
      q: "'1X9Fp5QoqKoJwxlmrNJICYfE5Et8G1K3G' IN parents AND (mimeType = 'audio/mp3' OR mimeType = 'audio/flac' OR mimeType = 'application/vnd.google-apps.folder')",
      corpus: 'user',
      pageToken: nextPageToken,
      kind: "drive#permissionList"
    }, (error, result) => {
      if (error) return console.log('The API returned an error: ' + error);
      nextPageToken = result.data.nextPageToken;
      console.log('token: ' + nextPageToken);

      const files = result.data.files;
      if (files.length) {
        processFile(drive,files,0);
        //console.log(files[1].webContentLink);
        //getNextFile(drive,nextPageToken);
      } else {
        console.log('No files found.');
      }
    });
  }
  else
    return;
}

function processFile(drive,files,index)
{
  //var stream = fs.createWriteStream("metadata.txt", {flags:'a'});          
  if (index < files.length)
  {
    //console.log(`${file.name} (${file.id})`);
    var file = files[index];
    var fileId = file.id;
    var tempPath = path.join(__dirname,'temp',file.name);
    var dest = fs.createWriteStream(tempPath);
    console.log(file);
    drive.files.get({headers: {Range: "bytes=0-8192"},fileId: fileId, alt: 'media'}, {responseType: 'stream'},
      function(err, res){
        //console.log(res.data);
        res.data
        .on('end', () => {
            //let tags = NodeID3.read(tempPath + file.name);
            NodeID3.read(tempPath, function(err, tags) { 
              console.log(tags);
              //fs.unlinkSync(tempPath);
              /*client.index({
                index: 'song',
                type: 'music',
                body: {
                    "file": file.name,
                    "title": tags.title,
                    "artist": tags.artist,
                    "album": tags.album,
                    "year": tags.year,
                    "genre": tags.genre,
                    "link": file.webContentLink,
                    "image": '',
                }
              }, function(err, resp, status) {
                if(err)
                {
                  console.log(err.message);
                  return;
                }
                //console.log(resp);
                console.log('downloaded ' + file.name);
                processFile(drive,files,index + 1);
              });*/
            });
            processFile(drive,files,index + 1);
        })
        .on('UnhandledPromiseRejection', function(reason, promise) {
          console.log('Unhandled Rejection at:', reason.stack || reason);
          // Recommended: send the information to sentry.io
          // or whatever crash reporting service you use
        })
        .on('error', err => {
            console.log('Error', err);
            return;
        })
        .pipe(dest);
      }
    )
  }
  else
  {
    console.log('download finished at ' + d.toISOString().slice(0,20));
    return;
  }
}

app.post("/listSong", function(req, res) {
  console.log(req.body.name);  
  client.search({
    index: 'song',
    type: 'music'
  }).then(function(resp) {
    //console.log(resp.hits.hits);
    res.status(200).send(resp.hits);
  }, function(err) {
    res.status(404).send(err.message);
  });
});

/*body call example
{
	"field" : "title",//field to search 
	"query": "physic"//value to search
}*/
app.post("/searchSong", function(req, res) {
  const query = {};
  console.log(req.body);
  query[req.body.field] = req.body.query;
  //const { name, artist, genre, album } = req.body;
  /*if (req.body.name) query.title = req.body.name;
  if (req.body.artist) query.artist = req.body.artist;
  if (req.body.genre) query.genre = req.body.genre;
  if (req.body.album) query.album = req.body.album;*/
  //query = query.substring(0,query.length - 1);
  console.log(query);
  client.search({
    index: 'song',
    type: 'music',
    //q: query //using luceni query
    body: {
      query: {
          fuzzy: query
      }
  }
  }).then(function(resp) {
    console.log(resp);
    res.status(200).send(resp.hits);
  }, function(err) {
    res.status(404).send(err.message);
  });
  //console.log(client.search);
  //res.status(200).send(query);
});

/*body call example
{
	"field" : "tags",//always tags o field where tags are saved
	"query" : "pop AND anime" //tags to seach with AND separated
}*/
app.post("/searchByTag", function(req, res) {  
  const query = {};
  //query = req.body.data;
  query.default_field = req.body.field;
  query.query = req.body.query;
  console.log(query);
  client.search({
    index: 'song',
    type: 'music',
    body: {
      query: {
        query_string: query
      }
  }
  }).then(function(resp) {
    console.log(resp);
    res.status(200).send(resp.hits);
  }, function(err) {
    res.status(404).send(err.message);
  });
});

/*call example{
  "id" : your id,
  "fields" : "field_to_update"
	"value" : "value_to_update"
}*/
app.post("/updateDocument", function(req, res) {  
  const update = {};  
  update[req.body.field] = req.body.value
  client.update({
    index: 'song',
    type: 'music',
    id: req.body.id,
    body: {
      doc: update
    }
  }).then(function(resp) {
    console.log(resp);
    res.status(200).send(resp);
  }, function(err) {
    res.status(404).send(err.message);
  });
});

var listener = app.listen(10000, function() {
  console.log('Your app is listening on port ' + listener.address().port);
});

process.on('unhandledRejection', (err) => { 
  console.error(err)
  process.exit(1)
})

/*to insert in mongodb
var mongoose = require('mongoose');

  var mongoDB = 'mongodb://localhost:27017/test';

  mongoose.connect(mongoDB,{ useNewUrlParser: true });
  mongoose.Promise = global.Promise;
  var db = mongoose.connection;

  db.on('error', console.error.bind(console, 'MongoDB connection error:'));

  var Schema = mongoose.Schema;

  var SongSchema = new Schema({
      title: String,
      artist: String,
      album: String,
      year: Number,
      genre: String,
      image: String
  });

  var SongModel = mongoose.model('Song', SongSchema );

  var song_instance = new SongModel({ title: tags.title,artist: tags.artist,album: tags.album,year: tags.year,genre: tags.genre,image: '' });

  song_instance.save(function (err) {
    if (err) console.log(err);
    // saved!
  });

  //para agregar propiedades(no funciona)
  drive2.files.update({auth: auth,fileId: fileId,body: {"appProperties": {"album": "ADAMAS/赤い罠(who loves it?)"}}}, function (err, data) {
    if (err) {
      console.error(err);
    } else {
      console.log(data.data);
    }
  });
*/