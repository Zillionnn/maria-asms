const { exec, spawn } = require('child_process');

let compressImgList = ["./1.png", "./2.png", "./3.png"]
let p  = compressImgList.join(' ')

console.log(p);
exec(`"/work/maria-asms/control/main" ${p}`, (err, stdout, stderr) => {
    // ...
    console.log(err)
    console.log(stdout)
    console.log(stderr)
  });
