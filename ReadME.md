
===========================================
============ How to run project ===========
===========================================
option 1: 
for development i created a shortcut -write "npm run dev" in the root folder
 instead of opening 2 command lines sepertly and run the client in one and the server in another.
i've created package.json in root folder in order to crate npm script commands.
the "dev" command open 2 cmd windows and run the server in one and the client in another

option 2 :
to run server - *open cmd *enter the 'server' folder *execute "npm run dev" 
to run client - *open cmd *enter the 'client' folder *execute "npm run build" 
======================================================================
========= what best practice/good examples can you find here =========
======================================================================
Angular
- how to devide an angular project to multi modules + lazy loading
- wrting RoutingModule for each Module
- how to devide SCSS files (Veriables, Mixing etc...)
- how to import SCSS files into components scss files @import '~styles/main';/*The tilde (~) will tell Sass to look in the src/ folder and is a quick shortcut to importing         Sass files.*/
- to create new angular project with scss: ng new My_New_Project --style=scss
Server
- using SOCKET.IO
- implement Oauth2.0 with facebook
- using mongoose 
  *the new [not deprecated] middleware
================================================================================  
============================= PROJECT IMPLEMENTATION ===========================
================================================================================  
the purpose of this app is to let users expirience date online in a different and special way

GENERAL Scenario 
*user connect to website using Facebook/Instegram/ Oauth2.0 Or Enter as Guest.
*user enter is favourite match parametes (age, location etc..) and click "start game"
*user wait until the server find a match for him
*the 2 players playing some random games together.
*in the process of playing the player reveal details about eachother (age, location,photo etc..) (THE process of revealing details not yet determind when wrting this words)
*after the game ends the player will decide if to continue the dating (should let them decide and let the other player know)
*player that played the  most will be in the leaderboard (to attract the players to play more)

---------------------------------GAME SOCKET.IO PROCESS---------------------------
player A                            Server                              player B
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


