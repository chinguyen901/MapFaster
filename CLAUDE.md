# Map Faster — CLAUDE.md

## Tổng quan dự án

**Map Faster** là ứng dụng web mobile-first (PWA) dành cho shipper/người giao hàng tại Việt Nam. Ứng dụng lấy vị trí GPS thực của điện thoại, nhận địa chỉ đích, rồi tính và hiển thị con đường ngắn nhất/nhanh nhất — bao gồm cả hẻm, chặt hẻm và so sánh đa tuyến.

Triển khai: GitHub Pages (public, miễn phí, dùng cá nhân).
Ngôn ngữ giao diện: Tiếng Việt hoàn toàn.

---

## Công nghệ (Tech Stack)

| Lớp | Lựa chọn | Lý do |
|---|---|---|
| UI Framework | React 18 + Vite | Fast build, PWA plugin sẵn |
| Bản đồ | Leaflet.js + OpenStreetMap | Miễn phí, có dữ liệu hẻm VN tốt |
| Routing engine | OSRM (public API) hoặc Valhalla | Hỗ trợ walking/motorcycle profile, vào hẻm được |
| Geocoding | Nominatim (OSM) + fallback Goong API | Nominatim miễn phí, Goong hiểu địa chỉ VN tốt hơn |
| PWA | vite-plugin-pwa | Cài được lên màn hình điện thoại như app |
| Styling | Tailwind CSS | Mobile-first, nhanh |
| Deploy | GitHub Pages (gh-pages branch) | Miễn phí, domain `*.github.io` |
| State | Zustand | Nhẹ, đủ dùng |

---

## Cấu trúc thư mục

```
map-faster/
├── public/
│   ├── icons/          # PWA icons (192x192, 512x512)
│   └── manifest.json   # PWA manifest
├── src/
│   ├── components/
│   │   ├── MapView.jsx          # Leaflet map container
│   │   ├── SearchBar.jsx        # Ô nhập địa chỉ đích
│   │   ├── RoutePanel.jsx       # Bảng so sánh các tuyến đường
│   │   ├── NavigationHeader.jsx # Header chỉ đường kiểu turn-by-turn
│   │   ├── Speedometer.jsx      # Hiển thị tốc độ (nếu có GPS speed)
│   │   └── BottomSheet.jsx      # Panel kéo lên từ dưới (mobile UX)
│   ├── hooks/
│   │   ├── useGeolocation.js    # Hook lấy vị trí GPS thực
│   │   ├── useRouting.js        # Hook gọi OSRM/Valhalla tính đường
│   │   └── useGeocoding.js      # Hook geocode địa chỉ tiếng Việt
│   ├── services/
│   │   ├── osrm.js              # Gọi OSRM API, parse nhiều tuyến
│   │   ├── geocoding.js         # Nominatim + Goong fallback
│   │   └── routeCompare.js      # So sánh, xếp hạng tuyến đường
│   ├── store/
│   │   └── useAppStore.js       # Zustand store (origin, dest, routes, mode)
│   ├── utils/
│   │   ├── formatters.js        # Format km, phút, địa chỉ VN
│   │   └── mapHelpers.js        # Tính bounding box, fit map
│   ├── App.jsx
│   └── main.jsx
├── vite.config.js
├── tailwind.config.js
├── package.json
└── CLAUDE.md
```

---

## Tính năng cốt lõi

### 1. Định vị GPS tự động
- Yêu cầu quyền `geolocation` khi mở app lần đầu
- Hiển thị vị trí thực trên bản đồ (blue dot)
- Tự cập nhật khi di chuyển (`watchPosition`)
- Fallback: cho phép nhập tay nếu GPS không bắt được

### 2. Nhập địa chỉ đích
- Ô tìm kiếm tự động gợi ý (autocomplete) theo địa chỉ Việt Nam
- Hỗ trợ: địa chỉ đầy đủ, tên đường + số nhà, tên địa điểm (quán, trường...)
- Ưu tiên kết quả trong bán kính gần vị trí hiện tại

### 3. Tìm đường cho Shipper (chức năng chính)
- Gọi OSRM với profile `motorcycle` (phù hợp xe máy vào hẻm)
- Lấy **tối thiểu 3 tuyến** (`alternatives=true&number=3`)
- Xếp hạng tuyến theo: **thời gian ước tính < khoảng cách < số đoạn rẽ**
- Highlight tuyến tốt nhất bằng màu xanh, tuyến phụ bằng màu xám
- Hiển thị: khoảng cách (km), thời gian (phút), loại đường (hẻm/đường lớn)

### 4. So sánh đa tuyến
- Panel dạng card liệt kê từng tuyến với: thời gian, khoảng cách, nhãn (Nhanh nhất / Ngắn nhất / Ít đèn đỏ hơn)
- Tap vào card → highlight tuyến đó trên bản đồ
- Badge "ĐỀ XUẤT" cho tuyến tốt nhất

### 5. Chỉ đường từng bước (Turn-by-turn)
- Header phía trên bản đồ hiển thị hướng rẽ tiếp theo + khoảng cách
- Mũi tên hướng rẽ (thẳng, trái, phải, vòng xuyến...)
- Tên đường/hẻm hiện tại
- Tự động chuyển bước khi vị trí GPS thay đổi

### 6. PWA — Cài như app thật
- `manifest.json` đúng chuẩn với icon, tên "Map Faster", màu chủ đạo
- Service worker cache tiles bản đồ để dùng offline một phần
- Thêm được vào màn hình chính iOS/Android

---

## Màn hình và UX (theo ảnh demo)

```
┌─────────────────────────────┐
│  [←]  Nhập địa chỉ đến...  │  ← SearchBar fixed top
├─────────────────────────────┤
│                             │
│         BẢN ĐỒ             │  ← MapView chiếm 60-70% màn hình
│    (route overlay xanh)     │
│                             │
│  [GPS]              [Full]  │
├─────────────────────────────┤
│  ✓ 5.2 km  •  18 phút  ⚡  │  ← BottomSheet tóm tắt
│  ────────────────────────── │
│  [Nhanh nhất] [Ngắn nhất]  │  ← Tab chọn tuyến
│  [Ít hẻm]    [Tùy chỉnh]  │
│  ────────────────────────── │
│  [  BẮT ĐẦU DẪN ĐƯỜNG  ]  │  ← CTA button
└─────────────────────────────┘
```

**Màu sắc:**
- Primary: `#1A73E8` (xanh dương — giống Google Maps, quen thuộc)
- Route tốt nhất: `#00C853` (xanh lá)
- Route phụ: `#9E9E9E` (xám)
- Background header điều hướng: `#1A1A2E` (tối, dễ đọc ngoài nắng)
- Text chính: `#212121`
- Accent/badge: `#FF6D00` (cam — nổi bật)

---

## API & Dịch vụ bên ngoài

### OSRM (routing) — Miễn phí
```
GET https://router.project-osrm.org/route/v1/driving/{lon1},{lat1};{lon2},{lat2}
  ?alternatives=3&steps=true&geometries=geojson&overview=full
```
- Profile nên dùng: `driving` (gần nhất với xe máy VN, OSRM public không có motorcycle)
- Nếu tự host: dùng profile `bicycle` hoặc custom motorcycle profile

### Nominatim (geocoding) — Miễn phí
```
GET https://nominatim.openstreetmap.org/search
  ?q={address}&countrycodes=vn&format=json&limit=5&addressdetails=1
```
- Bắt buộc header: `User-Agent: MapFaster/1.0 (chinguyen10022000@gmail.com)`

### Goong API (geocoding fallback) — Cần API key
- Hiểu địa chỉ Việt Nam, tên đường, số nhà tốt hơn Nominatim
- Đăng ký tại goong.io, free tier 10k requests/tháng
- Lưu key vào `.env.local`: `VITE_GOONG_API_KEY=...`

### OpenStreetMap Tiles — Miễn phí
```
https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png
```

---

## Môi trường & Biến môi trường

```env
# .env.local (không commit)
VITE_GOONG_API_KEY=your_key_here

# .env (commit được, giá trị mặc định public)
VITE_OSRM_BASE_URL=https://router.project-osrm.org
VITE_NOMINATIM_BASE_URL=https://nominatim.openstreetmap.org
VITE_APP_NAME=Map Faster
```

---

## Quy tắc code

- **Ngôn ngữ code:** English (tên biến, hàm, comment kỹ thuật)
- **Ngôn ngữ UI:** Tiếng Việt hoàn toàn (label, toast, error message)
- **Component:** Functional React, hooks only, không dùng class components
- **Không** dùng `any` nếu dùng TypeScript sau này
- **Không** gọi API trực tiếp trong component — luôn qua `services/` hoặc `hooks/`
- **Không** lưu API key vào code — dùng `.env.local`
- Mobile-first CSS: thiết kế cho màn hình 375px trước, responsive lên sau
- Tất cả tap target tối thiểu 44×44px (WCAG mobile)

---

## Deploy lên GitHub Pages

```bash
# Build
npm run build

# Deploy (dùng gh-pages package)
npm run deploy
```

```json
// package.json scripts
{
  "predeploy": "npm run build",
  "deploy": "gh-pages -d dist"
}
```

```js
// vite.config.js — quan trọng: base phải là tên repo
export default {
  base: '/map-faster/',  // hoặc '/' nếu dùng custom domain
  // ...
}
```

URL sau khi deploy: `https://{username}.github.io/map-faster/`

---

## Lưu ý đặc thù Việt Nam

- Địa chỉ VN thường viết ngược: số nhà → tên đường → phường → quận → thành phố
- Hẻm (alley) trong OSM thường tag `highway=residential` hoặc `highway=service` — OSRM đi được
- Tên đường có thể viết tắt: "Q.1" = "Quận 1", "P." = "Phường", "Đ." = "Đường"
- Geocoding cần normalize trước khi gọi API: bỏ dấu câu thừa, chuẩn hóa "tp hcm" → "Thành phố Hồ Chí Minh"
- Tốc độ trung bình xe máy trong hẻm: ~15 km/h — dùng để ước tính ETA thực tế hơn

---

## Milestone phát triển

1. **MVP (v0.1):** GPS + nhập địa chỉ + hiển thị 1 tuyến trên bản đồ
2. **v0.2:** So sánh 3 tuyến, xếp hạng, UI card chọn tuyến
3. **v0.3:** Turn-by-turn navigation header, auto-advance bước
4. **v0.4:** PWA manifest + service worker + cài được lên màn hình
5. **v1.0:** Deploy GitHub Pages, test thực tế trên đường

## Quy tắc bắt buộc : 
- Sau mỗi thay đổi lớn, chụp screen shot và so sánh với design gốc
- App phải thân thiện với mọi mobile ( mobile-friendly) - Hiện tại dùng public thông qua github
- Mọi Section phải có automation khi scroll