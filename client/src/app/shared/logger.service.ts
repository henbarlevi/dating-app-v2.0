// please note, 
// that IE11 now returns undefined again for window.chrome
// and new Opera 30 outputs true for window.chrome
// but needs to check if window.opr is not undefined
// and new IE Edge outputs to true now for window.chrome
// and if not iOS Chrome check
// so use the below updated condition
const isChromium = (window as any).chrome;
const winNav = (window as any).navigator;
const vendorName = winNav.vendor;
const isOpera = typeof (window as any).opr !== "undefined";
const isIEedge = winNav.userAgent.indexOf("Edge") > -1;
const isIOSChrome = winNav.userAgent.match("CriOS");

export class Logger {

  constructor() {
  }
  public l(tag: string, msg: any, color?: string) {
    if (color) {
      isChromium ?
        console.log(`%c ${tag? tag+'| ':''}${msg}`,`color: ${color}`)//`%c ** [Emited] Event :[${eventName}] **`, 'color: blue'
        : console.log(tag, msg);
    }
    else {
      console.log(`${tag? tag+'| ':''}${msg}`);
    }
    return this;
  }
  // public static dir(tag: string, msg: any, color?: string) {
  //   if (color) {
  //     console.dir(tag, colors[color](msg))
  //   }
  //   else {
  //     console.dir(tag, msg);
  //   }
  //   return this;
  // }
  // public static e(tag: string, msg: string, err: any) {
  //   console.log(tag, msg, err);
  // }
  // /**will print nice buffer title */
  // public static t(tag: string, msg: string, color?: string) {
  //   let b = '='.repeat(msg.length) + '==========================';
  //   let tl: number = tag.length;
  //   let space: string = ' '.repeat(tl + 1);
  //   if (color) {

  //     Logger.d(tag, `|${b}|\n${space}|============ ${msg} ============|\n${space}|${b}|\n`, color);


  //   }
  //   else {
  //     Logger.d(tag, `|${b}|\n${space}|============ ${msg} ============|\n${space}|${b}|\n`);

  //   }
  //   return this;
  // }
  // /**will print nice middle title */
  // public static mt(tag: string, msg: string, color?: string) {
  //   let b = '‾'.repeat(msg.length) + '‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾';

  //   let tl: number = tag.length;
  //   let space: string = ' '.repeat(tl + 1);
  //   if (color) {
  //     Logger.d(tag, `\n${space}|‾‾‾‾‾‾‾‾‾‾ ${msg} ‾‾‾‾‾‾‾‾‾|\n${space}‾${b}‾`, color);


  //   }
  //   else {
  //     Logger.d(tag, `\n${space}|‾‾‾‾‾‾‾‾‾‾ ${msg} ‾‾‾‾‾‾‾‾‾‾|\n${space}‾${b}‾`);

  //   }
  //   return this;
  // }
  // //
  // /**will print nice small title */
  // public static st(tag: string, msg: string, color?: string) {
  //   if (color) {

  //     console.log(tag, colors[color](`|----------- ${msg} -----------|`));
  //   }
  //   else {
  //     console.log(tag, `|----------- ${msg} -----------|`);
  //   }
  //   return this;
  // }
}
