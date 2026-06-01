# Map Faster — CLAUDE.md

## Tổng quan dự án

**Map Faster** là ứng dụng web mobile-first (PWA) dành cho shipper/người giao hàng tại Việt Nam. Lấy vị trí GPS thực, nhận địa chỉ đích, tính và so sánh nhiều tuyến đường — bao gồm hẻm, chặt hẻm — rồi dẫn đường turn-by-turn.

- **Deploy:** GitHub Pages (`https://{user}.github.io/Map_Faster/`)
- **Ngôn ngữ UI:** Tiếng Việt hoàn toàn
- **Mục tiêu dùng cá nhân** — không cần backend, không login

---

## Trạng thái hiện tại (sau Session 2 — 2026-06-01)

### ✅ Đã hoàn thành

| Hạng mục | File | Ghi chú |
|---|---|---|
| React PWA scaffold | `src/` toàn bộ | Build OK với Vite 4 |
| Standalone app | `index-standalone.html` | **File chính để test/deploy nhanh** |
| GPS watchPosition | `useGeolocation.js` / standalone | Pulse animation, auto-center lần đầu |
| Geocoding Nominatim | `useGeocoding.js` / standalone | Debounce 400ms, viewbox gần vị trí |
| OSRM 3 tuyến | `osrm.js` / standalone | `alternatives=3`, xếp hạng theo score |
| Route cards UI | `RoutePanel.jsx` / standalone | Badge ĐỀ XUẤT, checkmark, màu dot |
| Turn-by-turn header | `NavigationHeader.jsx` / standalone | SVG arrows, "Sau đó:", progress bar |
| Speed display | standalone | Vòng tròn km/h, GPS speed |
| Bottom bar nav | standalone | Khoảng cách · thời gian · 🚦 · ETA |
| Bottom sheet drag | standalone | Pointer events, snap MIN/MAX |
| PWA manifest | `vite.config.js` + `public/icons/` | icon-192, icon-512 |
| Deploy script | `package.json` | `npm run deploy` → gh-pages |
| Node 16 fix | Vite 4.5.x + Tailwind 3.4.x | WSL Node 16 tương thích |

### ⚠️ Vấn đề đã biết (cần fix session tiếp)

1. **Standalone vs React chưa đồng bộ** — logic đầy đủ nằm trong `index-standalone.html`, React components (`src/`) chưa có đủ các fix mới nhất
2. **OSRM public API giới hạn rate** — nếu nhiều request liên tiếp sẽ bị 429
3. **Nominatim chậm với địa chỉ hẻm VN** — "Hẻm 12 Nguyễn Văn A" thường không tìm thấy
4. **Auto-advance bước điều hướng chưa test thực tế** — logic 25m threshold chưa được xác nhận trên xe
5. **iOS Safari** — `watchPosition` cần user gesture trước, chưa handle
6. **Không có heading/bearing** — bản đồ không xoay theo hướng di chuyển
7. **GitHub repo chưa được tạo** — chưa deploy thực tế lên GitHub Pages

---

## Cấu trúc file (thực tế hiện tại)

```
Map_Faster/
├── index-standalone.html    ← APP CHÍNH — dùng để test + deploy GitHub Pages
├── index.html               ← Entry cho React build (Vite)
├── src/                     ← React PWA (cần sync với standalone)
│   ├── App.jsx
│   ├── index.css
│   ├── main.jsx
│   ├── components/
│   │   ├── BottomSheet.jsx
│   │   ├── MapView.jsx
│   │   ├── NavigationHeader.jsx
│   │   ├── RoutePanel.jsx
│   │   └── SearchBar.jsx
│   ├── hooks/
│   │   ├── useGeocoding.js
│   │   ├── useGeolocation.js
│   │   └── useRouting.js
│   ├── services/
│   │   ├── geocoding.js
│   │   ├── osrm.js
│   │   └── routeCompare.js
│   ├── store/useAppStore.js
│   └── utils/mapHelpers.js
├── public/icons/
│   ├── icon-192.png
│   ├── icon-512.png
│   └── icon.svg
├── vite.config.js           ← Vite 4 + VitePWA 0.17
├── tailwind.config.js       ← Tailwind 3.x
├── postcss.config.js        ← PostCSS (bắt buộc với Tailwind 3)
├── .env                     ← OSRM + Nominatim base URLs
├── .gitignore
└── package.json
```

---

## Tech Stack (đã xác nhận hoạt động)

| Lớp | Phiên bản | Node yêu cầu | Ghi chú |
|---|---|---|---|
| Vite | 4.5.x | 14.18+ (Node 16 ✓) | **Không dùng Vite 5/6/7/8** |
| @vitejs/plugin-react | 4.7.x | — | Vite 4 compatible |
| Tailwind CSS | 3.4.x | — | **Không dùng Tailwind 4** — cần `postcss.config.js` |
| vite-plugin-pwa | 0.17.x | — | Vite 4 compatible |
| React | 19.x | — | — |
| Leaflet.js | 1.9.4 | — | CDN trong standalone, npm trong React |
| Zustand | 5.x | — | Chỉ dùng trong React build |
| gh-pages | 6.x | — | Deploy script |

**Quan trọng:** Cài package với `--legacy-peer-deps` nếu conflict.

---

## API & Endpoint thực tế đang dùng

```
# OSRM routing (miễn phí, public)
GET https://router.project-osrm.org/route/v1/driving/{lo1},{la1};{lo2},{la2}
    ?alternatives=3&steps=true&geometries=geojson&overview=full

# Nominatim geocoding (miễn phí, cần User-Agent)
GET https://nominatim.openstreetmap.org/search
    ?q=...&countrycodes=vn&format=json&limit=7&addressdetails=1&namedetails=1
Header: User-Agent: MapFaster/1.0 (chinguyen10022000@gmail.com)

# OSM Tile (miễn phí)
https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png
```

---

## Màu sắc & Design System

| Tên | Hex | Dùng cho |
|---|---|---|
| Primary | `#1A73E8` | Button, icon box, user dot |
| Nav BG | `#1a1f3a` | Header điều hướng |
| Route Best | `#00C853` | Tuyến đề xuất |
| Route Alt | `#9E9E9E` | Tuyến phụ |
| Orange | `#FF6D00` | Destination pin, badge ĐỀ XUẤT |
| Text | `#212121` | Nội dung chính |

Icon hướng rẽ: SVG inline trong JS (`turnSVG(modifier, type)`) — white stroke trên nền Primary.

---

## Cách chạy & Deploy

```bash
# Test local (không cần build)
# Mở index-standalone.html trực tiếp trên trình duyệt
# Hoặc serve qua HTTP để GPS hoạt động trên iOS:
npx serve . -p 3000
# → http://[IP]:3000/index-standalone.html

# Build React PWA
npm run build        # → dist/

# Deploy lên GitHub Pages
npm run deploy       # predeploy: build → gh-pages -d dist
```

**Lưu ý GitHub Pages:**
- `vite.config.js`: `base: '/Map_Faster/'` (khớp tên repo)
- Sau `npm run deploy`: vào repo → Settings → Pages → Source: `gh-pages` branch
- URL: `https://[username].github.io/Map_Faster/`

---

## Quy tắc code

- **Ngôn ngữ code:** English (biến, hàm, comment)
- **Ngôn ngữ UI:** Tiếng Việt (label, toast, error, placeholder)
- Không comment mô tả WHAT — chỉ comment WHY khi không hiển nhiên
- Không gọi API trực tiếp trong component — qua `services/` hoặc `hooks/`
- Không lưu API key trong code — dùng `.env.local`
- Tap target tối thiểu 44×44px
- `--legacy-peer-deps` khi cài package mới

---

## Lưu ý đặc thù Việt Nam

- Địa chỉ VN viết: số nhà → tên đường → phường → quận → thành phố
- Hẻm trong OSM: `highway=residential` hoặc `highway=service` → OSRM đi được
- Tên đường viết tắt: "Q.1", "P.", "Đ.", "TP.HCM"
- Tốc độ xe máy trong hẻm: ~15 km/h → dùng để ước ETA thực tế
- Nominatim không tìm được "hẻm 12/4" → cần fallback Goong API

---

## Plan Session Tiếp Theo (Session 3)

### Ưu tiên cao — phải làm trước

**[P1] Tạo GitHub repo + deploy lần đầu**
- `git init && git add . && git commit -m "feat: init Map Faster"`
- Tạo repo `Map_Faster` trên GitHub
- `git remote add origin ... && git push -u origin main`
- `npm run deploy` → xác nhận URL hoạt động trên điện thoại thật

**[P2] Sync `index-standalone.html` → React components**
- Hiện tại standalone HTML là source-of-truth cho UI/logic
- Cần port các fix sau vào React: SVG turn icons, drag sheet, speed display, nav bar
- Hoặc quyết định: **chỉ dùng standalone** và bỏ React build (đơn giản hơn cho cá nhân)

**[P3] Goong API cho geocoding địa chỉ hẻm VN**
- Đăng ký tại `goong.io` → lấy API key miễn phí (10k req/tháng)
- Thêm vào `.env.local`: `VITE_GOONG_API_KEY=...`
- Trong standalone: fallback khi Nominatim trả về ít kết quả
- Endpoint: `https://rsapi.goong.io/Place/AutoComplete?api_key=...&input=...&location={lat},{lng}`

**[P4] Fix iOS Safari GPS**
- `watchPosition` trên iOS Safari yêu cầu HTTPS + user gesture
- Thêm button "Bắt đầu" cho lần đầu mở app → trigger GPS sau tap
- Test trên iPhone thực (Safari + Chrome iOS)

### Ưu tiên trung — nên làm trong session 3

**[P5] Map xoay theo hướng di chuyển (bearing)**
- Dùng `GeolocationCoordinates.heading` nếu có
- Fallback: tính bearing từ 2 GPS point liên tiếp
- Leaflet: `map.setBearing(heading)` — cần plugin `leaflet-rotate`

**[P6] ETA thực tế hơn cho hẻm**
- Thay vì dùng OSRM duration, ước tính lại:
  - Đoạn `highway=residential/service` → tốc độ 15 km/h
  - Đoạn đường lớn → tốc độ 30 km/h
- Cộng thêm 20% buffer cho tắc đường giờ cao điểm

**[P7] Lịch sử tìm kiếm gần đây**
- Lưu 5 địa chỉ cuối vào `localStorage`
- Hiển thị trong dropdown khi input rỗng
- Format: `{ name, lat, lng, timestamp }`

**[P8] Xử lý "Đến nơi"**
- Khi GPS < 50m so với destination → toast "Bạn đã đến nơi! 🎉"
- Tự động dừng navigation
- Hiển thị thời gian thực tế đã đi

### Ưu tiên thấp — session 4+

**[P9] Chế độ offline một phần**
- Service worker cache tile bản đồ khu vực đã đi qua
- Cache kết quả OSRM của 5 route gần nhất
- Hiển thị banner "Đang offline — dùng dữ liệu đã lưu"

**[P10] Voice guidance (Text-to-Speech)**
- Web Speech API — `speechSynthesis.speak()`
- Đọc hướng dẫn trước 200m: "Sau 200m, rẽ trái vào Hẻm 12"
- Ngôn ngữ: `lang: 'vi-VN'`

**[P11] Shipper mode — tối ưu đặc thù**
- Checkbox "Tránh đường lớn" → ưu tiên hẻm nhỏ (giảm thời gian tìm chỗ đỗ)
- Tính số điểm giao hàng trong 1 khu vực → gợi ý thứ tự giao tối ưu (TSP đơn giản)
- Chia sẻ ETA qua link: `?dest={lat},{lng}&eta=16:35`

**[P12] UI polish**
- Dark mode (tự động theo system)
- Haptic feedback khi chuyển bước (Vibration API)
- Animation mượt khi bottom sheet expand/collapse
- Icon app đẹp hơn (SVG → PNG proper)

---

## Quyết định kiến trúc cần thống nhất đầu Session 3

> **Câu hỏi:** Tiếp tục duy trì React PWA (`src/`) song song với `index-standalone.html`, hay chuyển hoàn toàn sang standalone HTML?
>
> - **Chọn React:** Code sạch hơn, dễ mở rộng, PWA đầy đủ — nhưng cần Node 20+ để build
> - **Chọn Standalone:** Không cần build, deploy là copy 1 file, Node 16 OK — nhưng code lớn trong 1 file
>
> **Gợi ý:** Nếu chỉ dùng cá nhân → **standalone** đủ dùng và đơn giản hơn nhiều.
