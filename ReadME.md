
# Dating App V2.0
web application that let people expirience online dating in a different way, by letting them play with each other in a co-op\vs manner in a variety of mini games
## Table of Contents
### 1.  [OverView](#OverView)
> - [motivation](#motivation)
> - Common Language
> - [how to run project](#howtorun)
> - tech details
### 2. [Best Practice Examples](#bestpractice)
### 3. [Project Explanation](#projectexplenation)

# ===============================
# OverView 
# ===============================
> ## motivation
the purpose of this app is to let users expirience date online in a different and special way
> ## How to run project <a name="howtorun"></a>
* ### option 1: 
for development i created shortcut - write *<span class="well">"npm run dev" </span>* in the <b> root folder</b>
 instead of opening 2 command lines sepertly and run the client in one and the server in another.
i've created package.json in root folder in order to crate npm script commands.
the "dev" command open 2 cmd windows and run the server in one and the client in another
* ### option 2 :
#### to run server - *open cmd *enter the 'server' folder *execute **"npm run dev"** 
#### to run client - *open cmd *enter the 'client' folder *execute **"npm run build"** - if you want to build for production and **"npm start"** for dev 

* ### Don't Forget To Run Mongo!
<div class="well">NOTE - to see readme styled with mark-down format inside VScode - download the extention "Markdown preview github styling</div>
<br />

> ## Common Language <a name="commonlanguage"></a>
- game - a dating game where 2 or more players play together in a variety of mini games
- minigame - in every dating session the 2 (or more) players will play several mini games
> ### Tech Details
- server side tech - nodejs, socket.io
- db - mongodb + mongoose
- client side tech - angualr 4.3 
# ===================================
# what best practice/good examples can you find here <a name="bestpractice"></a>
# ===================================

```scss
example for code block
var a:string = 'namw' 
```


> ### Angular
- how to devide an angular project to multi modules + lazy loading
- wrting RoutingModule for each Module
- handle configurations for each environment using environment.ts/environment.prod.ts etc... (you can also use [tokenInjection](https://stackoverflow.com/questions/43193049/app-settings-the-angular-4-way/43316544) instead)
> ### SCSS
- how to devide SCSS files (Veriables, Mixing etc...)
- how to import SCSS files into components scss files <span class="well"> @import '~styles/main';</span> The tilde <b>~</b> will tell Sass to look in the src/ folder and is a quick shortcut to importing         Sass files.  
- to create new angular project with scss:<b> ng new My_New_Project --style=scss</b>
> ### Server
- using SOCKET.IO
- CORS middleware
- implement Oauth2.0 with facebook
- using mongoose 
  *the new [not deprecated] middleware
  *use indexing (if u change indexing on schema in production read [this](:https://stackoverflow.com/questions/14342708/mongoose-indexing-in-production-code) to prevent performence issue)
> ### utils
- write good README.md with markdown format
# ====================================
# Project Explanation <a name="projectexplenation"></a>
# ====================================

### GENERAL Scenario 
1. user connect to website using Facebook/Instegram/ Oauth2.0 Or Enter as Guest.
2. user enter is favourite match parametes (age, location etc..) and click "start game"
3. user wait until the server find a match for him
4. the 2 players playing some random games together.
5. in the process of playing the player reveal details about eachother (age, location,photo etc..) (THE process of revealing details not yet determind when wrting this words)
6. after the game ends the player will decide if to continue the dating (should let them decide and let the other player know)
7. player that played the  most will be in the leaderboard (to attract the players to play more)

## GAME SOCKET.IO PROCESS
> this table describe what the direction of the events and in what order


|Event Name| Player A        | Server           | Player B  |
| :---------: | :-------------:   |:-------------:  | :-----:|
|Connected (Connection)| ----->    | |  |
|serch_for_partner|      |     <----- |   |
|Connected|      |      |<-----   |
|serch_for_partner|      |     -----> |   |
|found_partner||<---->||
|init_mini_game|      |     <-----> |   |
|ready_for_mini_game|----->||<-----|

# ====================================
# TODO 
# ====================================
* handle reconnection of user
* handle sockets emits from client with RXJS
* replace all hardcoded urls with environment variables
* do research on how to make the site be in top in google search - maybe this is the key : [Search Conosole](https://www.google.com/webmasters/tools/home?hl=en)
* when doing JSON.stringify(gameEventOrtimeout) in the gameroomManager on the mreged observable subscribed object - recevied "Converting circular structure to JSON" Fix this to avoid memory leak
* change the css arrow to gif
* maybe discard saving roomId in client - it already handled by server, so maybe there is no need to save it in client storage
* maybe save gameroom.players as object with key as user_id , to support continuing game event if some players disconnected (in future version when 2+ players games be available)
* gZip the client app in order to make it event more smaller - check how to do it in node/maybe it do it automatically
<style>
.well{
  border-radius: 30px  30px;
  padding:5px;
  background:#ffffcc;
  font-weight:bold;
  margin:0px 0px 
}
</style>
