// Dựng ảnh 3D đất sét noir cho từng slide từ docs/dat_set_noir_ch0N.json.
//
// Chạy:  cd tools/dat_set_noir && npm install && node dung_anh.mjs [1 2 ...]
// Ra:    chuong-0N/dat-set-noir/anh/NNN.jpg  (NNN = số slide trong bộ chương)
//
// Cảnh dựng trong Chromium headless bằng WebGL phần mềm (SwiftShader) — máy
// không có GPU vẫn chạy, chỉ chậm (vài giây mỗi ảnh). Trang được phục vụ
// qua một máy chủ tĩnh tại chỗ, vì Chromium chặn ES module mở bằng file://.
import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright-core';

const THU_MUC = path.dirname(fileURLToPath(import.meta.url));
const GOC = path.resolve(THU_MUC, '..', '..');

// Trình duyệt có sẵn trong môi trường dựng; máy khác thì đặt CHROMIUM_PATH.
// Ưu tiên headless_shell: bản chrome đầy đủ đời mới đã bỏ chế độ headless cũ
// mà playwright-core 1.48 gọi, nên chạy là thoát ngay.
const CHROMIUM = process.env.CHROMIUM_PATH
  || ['/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell',
    '/usr/bin/chromium', '/usr/bin/google-chrome']
    .find((p) => fs.existsSync(p));

const KIEU_TEP = { '.js': 'text/javascript', '.mjs': 'text/javascript', '.html': 'text/html' };

const TRANG = `<!doctype html><html><head><meta charset="utf-8">
<script type="importmap">{"imports":{"three":"/node_modules/three/build/three.module.js",
"three/addons/":"/node_modules/three/examples/jsm/"}}</script>
<style>body{margin:0;background:#000}</style></head>
<body><script type="module" src="/canh.js"></script></body></html>`;

function moMayChu() {
  const may = http.createServer((yeuCau, traLoi) => {
    if (yeuCau.url === '/') {
      traLoi.writeHead(200, { 'content-type': 'text/html' });
      return traLoi.end(TRANG);
    }
    const tep = path.join(THU_MUC, decodeURIComponent(yeuCau.url.split('?')[0]));
    if (!tep.startsWith(THU_MUC) || !fs.existsSync(tep)) {
      traLoi.writeHead(404);
      return traLoi.end();
    }
    traLoi.writeHead(200, { 'content-type': KIEU_TEP[path.extname(tep)] || 'application/octet-stream' });
    fs.createReadStream(tep).pipe(traLoi);
  });
  return new Promise((xong) => may.listen(0, '127.0.0.1', () => xong(may)));
}

async function main() {
  const dsChuong = process.argv.slice(2).map(Number).filter(Boolean);
  const chuong = dsChuong.length ? dsChuong : [1, 2, 3, 4, 5];
  if (!CHROMIUM) throw new Error('Không tìm thấy Chromium — đặt biến CHROMIUM_PATH');
  const may = await moMayChu();
  const trinhDuyet = await chromium.launch({
    executablePath: CHROMIUM,
    args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'],
  });
  const trang = await trinhDuyet.newPage({ viewport: { width: 1920, height: 1080 } });
  const loi = [];
  trang.on('pageerror', (e) => loi.push(String(e)));
  await trang.goto(`http://127.0.0.1:${may.address().port}/`);
  await trang.waitForFunction(() => window.sanSang === true, null, { timeout: 60000 }).catch(() => {
    throw new Error('Trang dựng cảnh không nạp được: ' + loi.join(' | '));
  });
  for (const n of chuong) {
    const nguon = path.join(GOC, 'docs', `dat_set_noir_ch0${n}.json`);
    const dsCanh = JSON.parse(fs.readFileSync(nguon, 'utf8'));
    const ra = path.join(GOC, `chuong-0${n}`, 'dat-set-noir', 'anh');
    fs.rmSync(ra, { recursive: true, force: true });
    fs.mkdirSync(ra, { recursive: true });
    for (const canh of dsCanh) {
      const duLieu = await trang.evaluate((c) => window.veCanh(c), canh);
      const tep = path.join(ra, String(canh.slide).padStart(3, '0') + '.jpg');
      fs.writeFileSync(tep, Buffer.from(duLieu.split(',')[1], 'base64'));
    }
    console.log(`Chương ${n}: ${dsCanh.length} ảnh -> ${path.relative(GOC, ra)}`);
  }
  if (loi.length) console.log('Lỗi trong trang:', loi.join('\n'));
  await trinhDuyet.close();
  may.close();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
