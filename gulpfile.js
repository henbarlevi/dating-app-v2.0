/**
 * How to use Gulp:
 * 1. install the gulp 4.0 v package with [npm i gulp@next --save-dev]
 * 2. create gulpefile.js in the root folder
 * 3. when runing the command "gulp" - it will look for task named 'default' in the gulpfile.js and run it
 */

const gulp = require('gulp');
const del = require('del');//delete files & folders



const paths = {
    //minigamesLogic
    minigamesLogic: {
        src: 'contract/minigamesLogic/**/*',
        dest: {
            client: 'client/src/app/game/games/logic',
            server: 'server/src/game/mini_games/logic'
        }
    },
    //game models
    gameModels:{
        src:'contract/models/**/*',
        dest: {
            client: 'client/src/app/game/models',
            server: 'server/src/game/models'
        }
    }

}
/**Logic
 * the logic of the minigames are need to be used in both client and server, this task will:
 * - Copy 'minigamesLogic' folder from the 'Contract' folder in the root and paste it inside the client and the server projects.
 * - also Watch for changes. and repaste it each change.
 */
const cleanClientLogic = () => { return del([paths.minigamesLogic.dest.client]); }//clean client logic folder
const cleanServerLogic = () => { return del([paths.minigamesLogic.dest.server]); }//clean server logic folder
const copyLogic = () => {
    return gulp.src(paths.minigamesLogic.src)
        .pipe(gulp.dest(paths.minigamesLogic.dest.client))
        .pipe(gulp.dest(paths.minigamesLogic.dest.server));
        
}
gulp.task('build-logic', gulp.series(gulp.parallel(cleanClientLogic, cleanServerLogic), copyLogic))//first clean the logic folder from client and server. then repaste them
/**Contract Models
 * common interfaces and enums that both client and server use are in the 'contract/models' folder
 * - Copy the models folder from the 'Contract' ('contract/models') folder in the root and paste it
 * - also Watch for changes. and repaste it each change.
 */
const copyModels = ()=>{
    return gulp.src(paths.gameModels.src)
    .pipe(gulp.dest(paths.gameModels.dest.client))
    .pipe(gulp.dest(paths.gameModels.dest.server));
}
gulp.task('build-models',copyModels);/**not clean models folder in client/server because it can aslo contain other models that not exist in the contract (TODO it will be better if i'll do selective cleaning if possible)*/

/**Watch */
gulp.task('watch', () => {
    gulp.watch(paths.minigamesLogic.src, gulp.series('build-logic'));
    gulp.watch(paths.gameModels.src, gulp.series('build-models'));

});

/**Default Task */
const build = gulp.series(gulp.parallel('build-logic','build-models'), 'watch');
gulp.task('default', build);