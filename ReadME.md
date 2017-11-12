============ How to run project ===========
option 1: 
for development i created a shortcut -write "npm run dev" in the root folder
 instead of opening 2 command lines sepertly and run the client in one and the server in another.
i've created package.json in root folder in order to crate npm script commands.
the "dev" command open 2 cmd windows and run the server in one and the client in another

option 2 :
to run server - *open cmd *enter the 'server' folder *execute "npm run dev" 
to run client - *open cmd *enter the 'client' folder *execute "npm run build" 


========= THE GAME PROCESS ==========

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


