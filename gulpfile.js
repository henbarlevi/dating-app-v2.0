/**
 * How to use Gulp:
 * 1. install the gulp 4.0 v package with [npm i gulp@next --save-dev]
 * 2. create gulpefile.js in the root folder
 * 3. when runing the command "gulp" - it will look for task named 'default' in the gulpfile.js and run it
 */

const gulp = require('gulp');
const del = require('del');//delete files & folders



const paths = {
    minigamesLogic: {
        src: 'contract/minigamesLogic/**/*',
        dest: {
            client: 'client/src/app/game/games/logic',
            server: 'server/src/game/mini_games/logic'
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

/**Watch */
gulp.task('watch', () => {
    gulp.watch(paths.minigamesLogic.src, gulp.series('build-logic'));
});

const build = gulp.series(gulp.parallel('build-logic'), 'watch');
gulp.task('default', build);