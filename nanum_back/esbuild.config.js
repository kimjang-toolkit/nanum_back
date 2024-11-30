const esbuild = require("esbuild");

esbuild
  .build({
    entryPoints: ["src/app.js"],
    bundle: true,
    external: ["aws-sdk"], // aws-sdk를 외부 모듈로 처리
    outfile: "dist/app.js",
  })
  .catch(() => process.exit(1));
