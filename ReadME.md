

# ===============================
# How to run project 
# ===============================

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

# ===================================
# what best practice/good examples can you find here 
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
# PROJECT IMPLEMENTATION 
# ====================================

the purpose of this app is to let users expirience date online in a different and special way

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
<div style="display:none">
player A                            Server                             player B
|-------------CONNECTED-------------->|-------------------------------------|
|<--------serch_for_partner-----------|-------------------------------------|
|-------------------------------------|<------------CONNECTED---------------|
|-------------------------------------|--------serch_for_partner----------->|
|<----------------------FOUND_PARTNER-|FOUND_PARTNER----------------------->|
|-------------------------------------|-------------------------------------|
|-------------------------------------|-------------------------------------|
|-------------------------------------|-------------------------------------|
|-------------------------------------|-------------------------------------|
|-------------------------------------|-------------------------------------|
</div>

<style>
.well{
  border-radius: 30px  30px;
  padding:5px;
  background:#ffffcc;
  font-weight:bold;
  margin:0px 0px 
}
</style>
