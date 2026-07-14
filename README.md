# Andijon Jamoat Transporti va Yo'l AI Monitoring Tizimi — Prototip

Frontend-only 3D dashboard prototipi (Vite + Three.js), shahar avtobuslari va yo'l
infratuzilmasi muammolarini AI orqali monitoring qilish tizimini simulyatsiya qiladi.
Interfeys to'liq o'zbek tilida.

## Ishga tushirish

npm install
npm run dev

So'ng chiqqan local URL'ni brauzerda oching.

## Testlarni ishga tushirish

npm test

## Sahifalar

- `index.html` — 3D live dashboard: bitta 4-yo'l chorrahasi, o'ng qo'l qoidasiga
  qat'iy rioya qiluvchi avtobuslar, simulyatsiya qilingan AI aniqlash belgilari,
  live minimap va trend grafigi. Pastki chap burchakdagi rejim tugmalari
  funksional: "Jonli rejim" (default), "Issiqlik xaritasi" (minimapda muammo
  zichligini ko'rsatadi) va "Simulyatsiya ijrosi" (avtobuslarni joyida
  to'xtatadi)
- `upload.html` — rasm/video yuklab, mock AI tahlil natijasini olish ("✕" tugmasi
  bilan sahifani yangilamasdan qayta fayl tanlash mumkin)
- `cameras.html` — kamera monitoring gridi (demo oqimlar; real kamera ulanmagan)
- `issues.html` — aniqlangan yo'l muammolari ro'yxati (turi, mock foto, GPS,
  darajasi) turi bo'yicha filtrlash bilan

Barcha sahifalarda bosh sahifaga qaytish uchun tugma/link mavjud.

Ushbu sahifalardagi barcha AI/kamera/GPS ma'lumotlari hozircha simulyatsiya
qilingan. `src/ai/AnalysisService.js` va `src/ai/DetectionService.js` — kelajakda
haqiqiy o'qitilgan modelni API orqali ulash uchun ikkita almashtiriladigan nuqta;
qolgan UI ularning hozirgi qaytarish shakliga mos qurilgan va o'zgarishga muhtoj
bo'lmaydi.

## 3D sahna arxitekturasi

- `src/scene/Route.js` — bitta 4-yo'l chorrahasi (`route-a` asosiy prospekt,
  `route-b` kesishuvchi ko'cha); yopiq CatmullRom egri chizig'i sifatida.
- `src/scene/Bus.js` — avtobus modeli (oyna, orqa oyna, chiroqlar, g'ildirak,
  ko'zgu, tomdagi konditsioner, bo'yoq chizig'i) va o'ng qo'l qoidasiga mos
  lane-offset harakat logikasi (`laneX = x - tangent.z * LANE_OFFSET`).
- `src/scene/City.js` — asfalt, chiziqlar, zebra o'tish joylari, bordyur,
  trotuar (plitka chok chiziqlari bilan), fonar ustunlari (nur effekti bilan),
  daraxtlar, yo'l chok/lyuk detallari va binolar. Kamera tomonidagi (foreground)
  hudud avtobuslarni ko'rish qulay bo'lishi uchun bino/fonar/daraxtlardan xoli
  qoldirilgan (`z > 16` chegarasi).
- `src/ui/Marker3D.js` / `src/ui/RightPanel.js` / `src/ui/LeftPanel.js` — 3D
  belgilar, live minimap/trend paneli va aniqlanganlar ro'yxati UI qismlari.

Avtobuslar orasidagi minimal masofa va o'ng qo'l qoidasi to'g'riligi har bir
marshrut/tezlik o'zgarishida Node.js simulyatsiya skripti orqali qayta
tekshiriladi (loyihaga commit qilinmaydi, faqat vaqtinchalik tekshiruv uchun).

## Eslatmalar

- AI aniqlash simulyatsiya qilingan (`src/ai/DetectionService.js`). Bu yagona
  almashtiriladigan modul sifatida loyihalashtirilgan: kelajakda haqiqiy
  model/backend ulash uchun faqat shu faylning ichini o'zgartirish kifoya.
- Backend, persistence yoki biznes-logika yo'q — bu faqat vizual prototip.
