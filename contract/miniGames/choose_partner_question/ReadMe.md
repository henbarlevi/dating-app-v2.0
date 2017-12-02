## choose_partner_question MINI-GAME SOCKET.IO PROCESS
> this table describe what the direction of the events and in what order
the game is handled

|Event Name| Player A        | Server           | Player B  | Comment |
| :---------: | :-------------:   |:-------------:  | :-----:| :----:|
|init_mini_game|      |     <-----> |   |tell the players what type of mini minigame to init and send them the random questions
|ready_for_mini_game|----->||<-----|players tell the server they are ready for the minigame