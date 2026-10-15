// Dựng mọi lớp hình minh họa của một chương thành ảnh PNG nền trong suốt:
// (Đặt trong remotion/ chứ không trong tools/: Node tìm gói theo chỗ đặt tệp, không theo thư mục đang đứng.)
//   public/minh-hoa/chNN/sSS_nen.png  (mũi tên, đường nối — nếu bố cục có)
//   public/minh-hoa/chNN/sSS_i.png    (mục thứ i)
// Đóng gói (bundle) MỘT lần rồi dựng từng ảnh: gọi "remotion still" cho mỗi
// ảnh thì đóng gói lại hơn trăm lần, mỗi lần ~10 giây.
// Dùng (trong video-dat-set/remotion): node dung_minh_hoa.mjs 1 [số slide ...]
import { bundle } from '@remotion/bundler';
import { renderStill, selectComposition } from '@remotion/renderer';
import fs from 'node:fs';
import path from 'node:path';

const chuong = Number(process.argv[2] ?? 1);
const chi = process.argv.slice(3).map(Number);
const ma = String(chuong).padStart(2, '0');
const cfg = JSON.parse(fs.readFileSync(`../du-lieu/minh_hoa_ch${ma}.json`, 'utf8')).slides;
const ra = `public/minh-hoa/ch${ma}`;
fs.mkdirSync(ra, { recursive: true });
const trinh = process.env.REMOTION_BROWSER_EXECUTABLE || undefined;
const goi = await bundle({ entryPoint: path.resolve('src/index.ts') });
for (const [so, mh] of Object.entries(cfg)) {
  if (chi.length && !chi.includes(Number(so))) continue;
  const lop = [...(['vong', 'chuoi', 'duong', 'trung_tam'].includes(mh.kieu) ? [-1] : []), ...mh.muc.map((_, i) => i)];
  for (const l of lop) {
    const inputProps = { chuong, so: Number(so), lop: l };
    const comp = await selectComposition({ serveUrl: goi, id: 'minh-hoa', inputProps, browserExecutable: trinh });
    const tep = `${ra}/s${String(so).padStart(2, '0')}_${l < 0 ? 'nen' : l}.png`;
    await renderStill({ composition: comp, serveUrl: goi, output: tep, inputProps, imageFormat: 'png',
      browserExecutable: trinh, chromiumOptions: { gl: 'swangle' } });
    console.log(tep);
  }
}
