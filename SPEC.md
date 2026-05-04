# SPEC.md — 旅遊英文學習 App
# Cursor 開發規格書（零歧義版）
# 版本：V2.0 定稿 | 請在每次對話開頭貼入此檔案

---

## 0. 核心原則（Cursor 必讀）

在開始任何程式碼之前，你必須遵守以下原則，違反任一條視為錯誤輸出：

1. **禁止使用任何 UI 套件**（MUI、Ant Design、Chakra 等），只能用 Tailwind CSS + Lucide Icons。
2. **禁止在元件內硬編碼任何課程文字**，所有英文句子、中文翻譯、音標、Tips 全部來自 JSON 檔。
3. **禁止使用 `localStorage` 以外的瀏覽器 API 儲存使用者設定與進度**（音檔快取例外，用 IndexedDB）。
4. **禁止安裝 `react-router-dom` 以外的路由套件**。
5. **每個新元件必須放在規定的目錄**，不可自行創建目錄。
6. **CSS 顏色禁止在 JSX 內使用 inline style 或 arbitrary Tailwind values**，只能使用 `src/styles/tokens.css` 中定義的 CSS 變數。
7. **禁止在 JSX 中直接呼叫 `localStorage`**，必須透過 `src/utils/storage.js` 封裝函式。
8. **音標渲染規則**：英文句子必須完整顯示（不截斷），KK 音標必須獨立成一行顯示於英文句子正下方。

---

## 1. 技術棧（固定，不可更改）

```
Framework   : React 18 + Vite
Styling     : Tailwind CSS（JIT mode）
Icons       : lucide-react
Fonts       : Google Fonts（Fraunces, Noto Sans TC, DM Mono）
Routing     : react-router-dom v6
TTS         : window.speechSynthesis（Web Speech API，內建，不需安裝）
Speech Rec  : window.SpeechRecognition（Web Speech API，內建，不需安裝）
IndexedDB   : idb（npm install idb）
PWA         : vite-plugin-pwa（npm install vite-plugin-pwa）
Linting     : ESLint + Prettier
```

**初始化指令：**
```bash
npm create vite@latest travel-english -- --template react
cd travel-english
npm install
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
npm install react-router-dom lucide-react idb vite-plugin-pwa
```

---

## 2. Design Token（所有顏色、字級、圓角由此定義）

檔案路徑：`src/styles/tokens.css`
在 `src/main.jsx` 中 import：`import './styles/tokens.css'`

```css
/* src/styles/tokens.css */
:root {
  /* ── 顏色 ── */
  --color-navy:        #0F1F3D;
  --color-navy-mid:    #1A3260;
  --color-teal:        #0EA5A0;
  --color-teal-light:  #5DD6D1;
  --color-gold:        #E8B84B;
  --color-cream:       #FAF7F2;
  --color-warm-gray:   #E8E2D9;
  --color-white:       #FFFFFF;
  --color-success:     #22C55E;
  --color-danger:      #EF4444;
  --color-a2:          #3B82F6;
  --color-b1:          #F59E0B;
  --color-text-primary:   #1A1A2E;
  --color-text-secondary: #5A6482;
  --color-text-muted:     #9399A8;

  /* ── 字級（設定頁可覆寫 --font-base-size） ── */
  --font-base-size:   20px;
  --font-sm:          0.82rem;
  --font-xs:          0.68rem;
  --font-mono:        'DM Mono', monospace;

  /* ── 行距（熟齡友善，50+ 歲目標族群） ── */
  --line-height-body:    1.85;   /* 內文句子、翻譯 */
  --line-height-kk:      1.5;    /* 音標列（DM Mono，較密） */
  --line-height-heading: 1.3;    /* 章節標題 */

  /* ── 圖示大小（手機底部導航，符合 WCAG 44px 觸控區） ── */
  --icon-nav:   24px;   /* BottomNav 圖示尺寸 */
  --icon-btn:   20px;   /* 卡片功能按鈕圖示尺寸 */

  /* ── 卡片間距 ── */
  --card-gap:      16px;   /* SentenceCard 上下間距 */
  --card-padding:  20px;   /* SentenceCard 內距 */

  /* ── 圓角 ── */
  --radius-card:   16px;
  --radius-btn:    10px;
  --radius-badge:  20px;

  /* ── 陰影 ── */
  --shadow-sm: 0 2px 8px rgba(15,31,61,0.08);
  --shadow-md: 0 8px 32px rgba(15,31,61,0.12);

  /* ── 固定高度（不可更改，確保 sticky 計算正確） ── */
  --topnav-h:    56px;   /* 桌面版頂部導航高度 */
  --topnav-h-sm: 52px;   /* 手機版頂部導航高度 */
  --bottomnav-h: 56px;   /* 手機版底部導航高度 */
  --sidebar-w:   240px;  /* 桌面版左側選單寬度 */
}
```

**Tailwind 設定（tailwind.config.js）：**
```js
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        navy:    'var(--color-navy)',
        'navy-mid': 'var(--color-navy-mid)',
        teal:    'var(--color-teal)',
        'teal-light': 'var(--color-teal-light)',
        gold:    'var(--color-gold)',
        cream:   'var(--color-cream)',
      },
      fontFamily: {
        display: ['Fraunces', 'serif'],
        sans:    ['Noto Sans TC', 'sans-serif'],
        mono:    ['DM Mono', 'monospace'],
      },
      borderRadius: {
        card: 'var(--radius-card)',
        btn:  'var(--radius-btn)',
      }
    }
  }
}
```

---

## 3. 專案目錄結構（固定，不可新增或移動）

```
src/
├── data/
│   ├── topics.json                   ← 主題索引
│   ├── travel/
│   │   ├── 01_Preparation.json
│   │   ├── 02_Airport_Checkin.json
│   │   ├── 03_Security_and_Gate.json
│   │   ├── 04_Inflight_Conversation.json
│   │   ├── 05_Immigration.json
│   │   ├── 06_Airport_Transportation.json
│   │   ├── 07_Hotel_Checkin.json
│   │   ├── 08_Dining_Out.json
│   │   ├── 09_Shopping_and_Tax_Refund.json
│   │   ├── 10_Directions_and_Navigation.json
│   │   ├── 11_Sightseeing_and_Tours.json
│   │   ├── 12_Car_Rental.json
│   │   ├── 13_Emergencies.json
│   │   └── 14_Return_Flight.json
│   └── social/                       ← 未來新增，結構完全相同
│
├── components/
│   ├── layout/
│   │   ├── TopNav.jsx                ← 頂部麵包屑（所有頁共用）
│   │   ├── BottomNav.jsx             ← 手機底部導航（所有頁共用）
│   │   └── BackToTop.jsx             ← 回頂部按鈕（所有頁共用）
│   ├── home/
│   │   ├── TopicGrid.jsx             ← 首頁主題 Grid
│   │   └── TopicCard.jsx             ← 單一主題卡片
│   ├── learn/
│   │   ├── ChapterList.jsx           ← 章節列表（手機獨立頁 / 桌面左欄，共用）
│   │   ├── ChapterCard.jsx           ← 單一章節卡片
│   │   ├── SentenceCard.jsx          ← 單一句子卡片
│   │   ├── KKAnnotation.jsx          ← KK 音標渲染（關鍵元件）
│   │   └── ClozeToggle.jsx           ← 遮蔽模式切換器
│   ├── quiz/
│   │   ├── QuizPage.jsx              ← 測驗主頁
│   │   ├── MultipleChoice.jsx
│   │   ├── FillBlank.jsx
│   │   ├── ListeningQ.jsx
│   │   └── QuizResult.jsx            ← 結果頁
│   ├── review/
│   │   ├── ReviewPage.jsx
│   │   ├── Favorites.jsx
│   │   └── WrongList.jsx
│   └── settings/
│       └── SettingsPage.jsx
│
├── hooks/
│   ├── useProgress.js                ← 學習進度 CRUD
│   ├── useFavorites.js               ← 收藏 CRUD
│   ├── useWrongList.js               ← 錯題 CRUD
│   ├── useTTS.js                     ← TTS 播放 + IndexedDB 快取
│   ├── useSpeechRec.js               ← 語音辨識（V1.2）
│   └── useSettings.js                ← 設定讀寫
│
├── utils/
│   ├── storage.js                    ← localStorage / IndexedDB 封裝（唯一入口）
│   ├── similarity.js                 ← Levenshtein 字串相似度
│   └── topicLoader.js                ← 動態載入 JSON 的統一函式
│
├── styles/
│   └── tokens.css                    ← Design Token（顏色/字級/圓角/高度）
│
├── App.jsx                           ← Router 根元件
└── main.jsx                          ← 入口，import tokens.css
```

---

## 4. topics.json 結構（主題索引）

```json
[
  {
    "topic_id": "travel",
    "topic_name": "旅遊英文",
    "icon": "✈️",
    "data_dir": "travel",
    "total_chapters": 14,
    "available": true
  },
  {
    "topic_id": "social",
    "topic_name": "社交英文",
    "icon": "🤝",
    "data_dir": "social",
    "total_chapters": 0,
    "available": false
  }
]
```

**規則：**
- `available: false` 的主題顯示灰色卡片 + 「即將推出」標籤，點擊無效果
- 新增主題只需在此檔案新增一筆，UI 自動渲染，不需修改任何元件

---

## 5. 章節 JSON 結構（V2.2 標準）

每個 JSON 檔均符合以下結構，Cursor 不可更改此結構：

```json
{
  "chapter_id": "07",
  "chapter_name": "飯店 Check-in",
  "sentences": [
    {
      "id": "07-001",
      "en": "I'd like to check in, please.",
      "type": "statement",
      "keywords": [
        { "word": "check in", "kk": "/tʃek ɪn/", "zh": "辦理入住" }
      ],
      "zh": "我要辦理入住。",
      "level": "A2",
      "tags": ["hotel", "arrival"],
      "tips": "通常下午兩點或三點後才能 Check-in。",
      "audio": null
    }
  ],
  "quiz": {
    "multiple_choice": [
      {
        "question": "飯店櫃台說『Can I have your ID?』，請問他在要求什麼？",
        "options": [
          { "en": "Your passport or ID card", "zh": "您的護照或身份證" },
          { "en": "Your credit card", "zh": "您的信用卡" },
          { "en": "Your luggage tag", "zh": "您的行李標籤" },
          { "en": "Your room key", "zh": "您的房卡" }
        ],
        "answer": "Your passport or ID card"
      }
    ],
    "fill_blank": [
      { "sentence": "I have a ______ under the name Johnson.", "answer": "reservation" }
    ],
    "listening": [
      { "sentence_id": "07-001" }
    ]
  }
}
```

### V2.2 結構升級說明（5 項）

**1. 句子 `type` 欄位（語調分類）**
- 值：`"statement"` | `"question"`
- 判定規則：句子結尾為 `?` → `"question"`，否則 → `"statement"`
- 用途：TTS 播放時 `pitch` 調整（問句尾音上揚），未來 AI 口說評分的評判基準

**2. 關鍵字三位一體（`keywords[].zh`）**
- 結構：`{ "word": string, "kk": string, "zh": string }`
- `zh` 為該關鍵字的繁體中文（台灣慣用語）
- 用途：音標列顯示中文解釋、未來單字卡複習模組
- KKAnnotation.jsx 顯示順序：`word`（青色）→ `kk`（灰色）→ `zh`（暖色小字）

**3. 句子 `audio` 欄位（離線快取狀態）**
- 初始值：`null`（尚未下載）
- 下載成功後由程式更新為 IndexedDB 的 key（字串，如 `"audio_07-001"`）
- 程式播放邏輯：`audio !== null` → 從 IndexedDB 取 Blob → 播放；`audio === null` → TTS 即時產生並存入 IndexedDB 後更新 key
- **注意**：此欄位由程式在 runtime 維護，JSON 檔案中永遠維持 `null`，實際狀態存於 localStorage `audio_status_{topicId}_{chapterId}`

**4. 選擇題選項雙語化（`options` 物件陣列）**
- 舊格式（廢棄）：`"options": ["A", "B", "C", "D"]`
- 新格式：`"options": [{ "en": string, "zh": string }, ...]`
- `answer` 欄位對應 `en` 的值（完整英文字串，不用索引）
- 渲染：每個選項顯示英文（主）+ 中文（副，小字灰色），50+ 用戶可直接理解語意

**5. 聽力題單一來源（移除 `answer`）**
- 舊格式（廢棄）：`{ "sentence_id": "07-001", "answer": "I'd like to check in, please." }`
- 新格式：`{ "sentence_id": "07-001" }`
- 程式從 `sentences` 陣列找 `id === sentence_id` 取 `en` 作為標準答案
- 好處：消除資料重複，sentences 修正後 quiz 自動同步，不會打架

### 批次升級指令（給 Cursor）

```
【資料結構升級 V2.2：批次修正所有 JSON】

讀取 src/data/travel/ 下所有 01–14 章 JSON，進行以下升級（禁止修改課程內容）：

1. sentences 每個物件：
   - 新增 "type"：結尾為 ? → "question"，否則 → "statement"
   - 新增 "audio": null
   - keywords 每個物件補上 "zh"（該單字繁體中文，台灣慣用語）

2. quiz.multiple_choice 每題：
   - options 從字串陣列改為 [{ "en": "...", "zh": "..." }] 物件陣列
   - answer 改為對應選項的完整 en 字串

3. quiz.listening 每題：
   - 刪除 answer 欄位，只保留 sentence_id

4. 嚴格要求：
   - JSON 格式正確，檔名不變
   - 繁體中文使用台灣慣用語
   - 不修改任何 en / zh / tips / level / tags 原有內容
```

---

## 6. 關鍵元件規格

### 6.1 KKAnnotation.jsx（音標渲染，最重要）

**輸入 Props：**
```js
// en: string — 完整英文句子
// keywords: Array<{ word: string, kk: string, zh: string }>
// clozeMode: 'normal' | 'hide-en' | 'hide-zh' | 'cloze-kw'
```

**渲染規則（必須嚴格遵守）：**
1. 第一行：完整英文句子，語序不截斷，不在句子中插入任何音標
2. 第二行（音標列）：只列出 keywords 中的詞，格式為「word /kk/ 中文」，多個關鍵字以空格分隔
3. 第三行：中文翻譯
4. cloze-kw 模式：關鍵字以 `___` 底線取代，點擊顯示答案，不計分

**正確 JSX 結構：**
```jsx
<div className="sentence-block">
  {/* 行一：完整英文句子，關鍵字加底線樣式，但不插入音標 */}
  <p className="en-sentence">
    {renderEnWithHighlight(en, keywords, clozeMode)}
  </p>

  {/* 行二：音標列，僅在有 keywords 時顯示 */}
  {keywords.length > 0 && (
    <p className="kk-line font-mono text-xs text-muted mt-1">
      {keywords.map(kw => (
        <span key={kw.word} className="mr-4">
          <span className="text-teal font-medium">{kw.word}</span>
          <span className="ml-1 text-muted">{kw.kk}</span>
          {kw.zh && (
            <span className="ml-1 text-amber-600 text-xs not-mono">{kw.zh}</span>
          )}
        </span>
      ))}
    </p>
  )}

  {/* 行三：中文翻譯 */}
  <p className="zh-sentence">{zh}</p>
</div>
```

---

### 6.2 TopNav.jsx（頂部麵包屑，所有頁面共用）

```js
// Props:
// crumbs: Array<{ label: string, path?: string }>
// 最後一個 crumb 無 path（當前位置，不可點擊）
```

**渲染規則：**
- 第一個 item 永遠是 🏠 圖示（Home 圖示，使用 Lucide `Home`），點擊導向 `/`
- 固定在頁面頂部（`position: sticky; top: 0; z-index: 50`）
- 高度：桌面 56px，手機 52px
- 背景：`--color-navy`，文字白色
- 手機版路徑過長時，中間的 crumb 截斷為 `...`，保留圖示與最後一個 crumb

---

### 6.3 ChapterList.jsx（章節列表，手機 / 桌面共用）

```js
// Props:
// topicId: string
// chapters: Array<{ chapter_id, chapter_name, total, progress, offline }>
// onSelect: (chapterId) => void
// currentChapterId?: string  ← 桌面版 highlight 用
```

**渲染規則：**
- **手機版**（`< 768px`）：全螢幕獨立頁，頂部有 TopNav，底部有 BottomNav
- **桌面版**（`≥ 768px`）：左側固定欄（寬 `--sidebar-w`），`overflow-y: auto`，不影響右側內容捲動
- 每個章節卡片顯示：圖示、章節編號、名稱、進度條、百分比
- 有 `offline: true` 的章節右上角顯示 📥 角標（Lucide `Download` 圖示）
- 目前選中章節（`currentChapterId`）左側顯示 teal 色邊條

---

### 6.4 SentenceCard.jsx

```js
// Props:
// sentence: { id, en, type, keywords, zh, level, tags, tips, audio }
//           type: 'statement' | 'question' — 影響 TTS pitch
//           audio: null | string — null=TTS即時，string=IndexedDB key
// clozeMode: string
// isPlayed: boolean       ← 是否已學（已播放過）
// isFavorite: boolean
// onPlay: () => void      ← 播放時呼叫，外層 hook 標記已學
// onFavorite: () => void
```

**卡片由上至下結構（嚴格順序）：**
```
┌────────────────────────────────┐
│ [句子 ID]        [A2] [hotel]  │  ← 頂部 meta row
│                                │
│ 完整英文句子                    │  ← 行一
│ keyword /kk/ 中文  kw2 /kk/   │  ← 行二（音標列）word + kk + zh三位一體
│ 中文翻譯                       │  ← 行三
│                                │
│ ▶ 播放   🤍 收藏   💡 Tips     │  ← 功能按鈕列
│                                │
│ [Tips 內容，展開/收合]          │  ← 可選，預設收合
└────────────────────────────────┘
```

**最小點擊區域：所有按鈕 min-height 44px, min-width 44px（WCAG 2.1）**

---

### 6.5 ClozeToggle.jsx（遮蔽模式切換器）

```js
// Props:
// mode: 'normal' | 'hide-en' | 'hide-zh' | 'cloze-kw'
// onChange: (mode) => void
```

**渲染規則：**
- 固定於學習頁面頂部，TopNav 正下方（sticky，top: var(--topnav-h)）
- 四個選項水平排列，寬度均等
- 選中項背景 `--color-teal`，文字白色
- 切換後所有展開的 Tips 收合，所有遮蔽恢復

---

### 6.6 BackToTop.jsx

```js
// 無 Props
// 行為：
// - 監聽 scroll，超過 200px 後顯示（淡入）
// - 固定於右下角（fixed, bottom: calc(var(--bottomnav-h) + 16px), right: 16px）
// - 使用 Lucide ChevronUp 圖示，不顯示文字
// - 點擊平滑捲回頂部（behavior: 'smooth'）
// - 桌面版 bottom: 16px（無底部導航列）
```

---

## 7. Hooks 規格

### 7.1 useSettings.js

```js
// localStorage key: 'app_settings'
// 預設值：
const DEFAULT_SETTINGS = {
  userName: '',          // 空字串 → 顯示「旅行者」
  ttsRate: 1.0,          // 0.7 | 1.0 | 1.3
  ttsGender: 'female',   // 'male' | 'female'
  listeningMaxPlays: 3,  // 1 | 2 | 3
  fontSize: 'md',        // 'sm'=18px | 'md'=20px | 'lg'=22px | 'xl'=26px
  showLevelBadge: true,
  clozeMode: 'normal',
};
// 回傳：[settings, updateSetting, resetSettings]
// updateSetting(key, value) → 只更新單一 key，其餘保留
```

---

### 7.2 useProgress.js

```js
// localStorage key 格式：'progress_{topicId}_{chapterId}'
// 例：'progress_travel_07' → ['07-001', '07-003', ...]

// 回傳：
// {
//   isLearned: (sentenceId) => boolean,
//   markLearned: (sentenceId) => void,   ← 播放時呼叫
//   getChapterProgress: (chapterId) => { learned: number, total: number },
//   resetProgress: (topicId?) => void,   ← 無參數時清除全部
// }
```

---

### 7.3 useTTS.js

```js
// 回傳：
// {
//   speak: (text, options?) => void,
//   isSpeaking: boolean,
//   isSupported: boolean,
// }
// options: { rate, gender } → 從 useSettings 取得
// 快取邏輯（V1.3）：播放前查 IndexedDB key `tts_{hash(text)}`
//   → 有快取：AudioBuffer 播放
//   → 無快取：speechSynthesis 播放，同時非同步存入 IndexedDB
```

---

### 7.4 useWrongList.js

```js
// localStorage key：'wrong_{topicId}'
// 結構：[{ id, question, userAnswer, correctAnswer, streak }]
//
// 常數（不可硬編碼，必須參照此常數）：
const MAX_STREAK = 3; // streak 達此值時自動移除

// streak 計算規則：
//   - 在複習中心答對 +1
//   - 在正式測驗卷答對 +1
//   - 答錯 → streak 重置為 0
//   - streak >= MAX_STREAK → 自動從錯題本移除
//
// UI 呈現：連對進度圓點共 MAX_STREAK 個（○○○），已達為 ●，未達為 ○

// 回傳：
// { wrongList, addWrong, updateStreak, removeWrong, clearAll }
```

---

### 7.5 useFavorites.js

```js
// localStorage key：'favorites_{topicId}'
// 結構：[{ id, en, zh, kk_line, chapter_id, chapter_name }]
//   kk_line：該句的音標列文字，供收藏夾播放時顯示

// 回傳：
// {
//   favorites: Array,
//   isFavorite: (sentenceId) => boolean,
//   addFavorite: (sentence, chapterInfo) => void,
//   removeFavorite: (sentenceId) => void,
//   clearAll: () => void,
// }

// 收藏夾 UI 操作（Favorites.jsx 必須提供）：
//   ▶ 播放：呼叫 useTTS speak(en)
//   🗑️ 移除：呼叫 removeFavorite，操作前跳出確認 Dialog
//   🔗 回原課程：navigate(`/${topicId}/${chapter_id}`)
```

---

### 7.6 useSpeechRec.js（V1.2）

```js
// 引擎：window.SpeechRecognition || window.webkitSpeechRecognition
// 本 hook 為 V1.2 開發階段，V1.0 / V1.1 不需實作
//
// 回傳：
// {
//   isSupported: boolean,         // 瀏覽器是否支援
//   isListening: boolean,         // 錄音中
//   transcript: string,           // 最新辨識結果
//   start: () => void,            // 開始錄音（需在 onClick 中直接呼叫，iOS 限制）
//   stop: () => void,             // 停止錄音
//   reset: () => void,            // 清除 transcript
// }
//
// 設定：lang='en-US', interimResults=false, maxAlternatives=1
// 相似度判定：傳入 src/utils/similarity.js 的 calcSimilarity(a, b)
//   回傳 0~1，>= 0.7 視為合格
// iOS Safari 注意：.start() 必須在 onClick 事件堆疊內直接呼叫，不可包在 Promise / setTimeout
```

| 用途 | localStorage Key | 型別 |
|------|-----------------|------|
| 使用者設定 | `app_settings` | Object |
| 旅遊英文進度（每章） | `progress_{topicId}_{chapterId}` | Array\<string\> |
| 旅遊英文收藏 | `favorites_{topicId}` | Array\<Object\> |
| 旅遊英文錯題 | `wrong_{topicId}` | Array\<Object\> |
| 上次學習章節（測驗入口用） | `last_chapter_{topicId}` | string（chapterId） |
| 音檔下載狀態（各章） | `audio_status_{topicId}_{chapterId}` | Object：`{ [sentenceId]: string \| null }` |
| PWA Banner 關閉時間 | `pwa_banner_dismissed` | timestamp |
| IndexedDB DB 名稱 | `TravelEnglishAudio` | — |
| IndexedDB Store 名稱 | `audioCache` | — |

---

## 9. 路由結構（react-router-dom v6）

```jsx
// App.jsx
<Routes>
  <Route path="/"                          element={<HomePage />} />
  <Route path="/:topicId"                  element={<ChapterListPage />} />
  <Route path="/:topicId/:chapterId"       element={<LearnPage />} />
  {/* LearnPage 內的 Tab 切換用 React state（useSearchParams 保留 ?tab= 以利分享） */}
  {/* ?tab=sentences | cloze | speech | quiz | review | settings */}
  <Route path="/review"                    element={<ReviewPage />} />
  <Route path="/settings"                  element={<SettingsPage />} />
</Routes>
```

**LearnPage 六大 Tab 路由規則：**
- Tab 切換透過 URL query string：`?tab=sentences`（預設）、`?tab=cloze`、`?tab=speech`、`?tab=quiz`、`?tab=review`、`?tab=settings`
- 使用 `useSearchParams` 讀寫，可直接分享特定 Tab 的 URL
- 頁面重整後恢復對應 Tab 狀態
- 手機版底部導航的 tab 切換用 `useNavigate`，不用 `<a>` 標籤

---

## 10. RWD 斷點規則

| 斷點 | 寬度 | 佈局 |
|------|------|------|
| 手機 | < 768px | 頂部 TopNav + 底部 BottomNav + 全寬單欄 |
| 桌面 | ≥ 768px | 頂部 TopNav + 左側 ChapterList（240px）+ 右側內容 |

**Tailwind breakpoint：** 使用 `md:` 前綴（預設 768px）

**首頁 TopicGrid Grid 欄數：**
```
grid-cols-2 md:grid-cols-3 lg:grid-cols-4
```

**章節列表 ChapterGrid 欄數：**
```
手機版：獨立頁面（全寬列表，非 Grid）
桌面版：左側固定選單（非 Grid）
```

---

## 11. 設定頁完整規格

```
設定頁 URL：/settings

分組顯示（Accordion 或分區塊）：

┌─ 👤 個人設定 ──────────────────────────────┐
│ 你的名稱：[文字輸入框，max 10 字]           │
│ （用於首頁歡迎語，空白顯示「旅行者」）       │
└────────────────────────────────────────────┘

┌─ 🔊 語音設定 ──────────────────────────────┐
│ 語速：[慢] [中✓] [快]                      │
│ 聲音：[男聲] [女聲✓]                       │
└────────────────────────────────────────────┘

┌─ 🎧 聽力設定 ──────────────────────────────┐
│ 每題最多播放次數：[1] [2] [3✓]             │
└────────────────────────────────────────────┘

┌─ 👁 顯示設定 ──────────────────────────────┐
│ 字體大小：[小] [中✓] [大]                  │
│ 顯示難度標籤：[開✓] [關]                   │
└────────────────────────────────────────────┘

┌─ 📖 學習模式 ──────────────────────────────┐
│ 遮蔽模式：[正常✓] [遮英文] [遮中文] [挖字]  │
└────────────────────────────────────────────┘

┌─ 📥 離線管理 ──────────────────────────────┐
│ （列出所有 14 章，每章顯示下載狀態）         │
│ [一鍵全部下載] [清除所有音檔]               │
└────────────────────────────────────────────┘

┌─ 🔄 資料管理 ──────────────────────────────┐
│ [重置學習進度]  → 確認 Dialog → 執行        │
│ [清除所有資料] → 確認 Dialog → 執行         │
└────────────────────────────────────────────┘
```

**所有帶破壞性操作的按鈕（紅色）必須跳出 Confirm Dialog，Dialog 內有取消與確認兩個按鈕。**

---

## 12. 測驗系統規格

### 入口邏輯
```js
// 從 /review tab 點進測驗：
// 1. 讀取 lastLearnedChapter（存於 localStorage key: 'last_chapter_{topicId}'）
// 2. 有值 → 直接進入 /{topicId}/{chapterId}/quiz
// 3. 無值 → 顯示章節選擇清單（已測驗章節顯示上次分數）
```

### 題型渲染順序
```
1. 選擇題（4 題）→ 選後立即顯示對錯，不可更改
2. 填空題（3 題）→ 提交後才比對（比對時 toLowerCase() 去除首尾空格，不分大小寫）
3. 聽力題（3 題）→ 播放按鈕剩餘次數顯示，提交後比對
```

### 結果頁
```
顯示：答對 X / 10
每題：題目 + 你的答案（✓ 或 ✗）+ 正確答案
按鈕：[再做一次] [回章節]
提交後：錯題批次寫入 useWrongList
```

---

## 13. 功能鍵可見性規則（禁止違反）

| 元件 | 固定方式 | 位置 |
|------|---------|------|
| TopNav（麵包屑） | `sticky top-0 z-50` | 頁面頂部 |
| ClozeToggle（學習頁） | `sticky top-[var(--topnav-h)] z-40` | TopNav 正下方 |
| BottomNav（手機） | `fixed bottom-0 z-50` | 頁面底部 |
| BackToTop 按鈕 | `fixed bottom-[calc(var(--bottomnav-h)+16px)] right-4`（手機） | 右下角 |
| 測驗「提交」按鈕 | 內容頁最後，無需 fixed（使用者捲動到底即看到） | 題目下方 |

**SentenceCard 內的按鈕（播放、收藏、Tips）在卡片內部即可見，不需 sticky。**

---

## 14. 語音功能規格

### TTS 播放
```js
// 使用 window.speechSynthesis
// lang: 'en-US'
// 語速 rate：從 useSettings 取得（0.7 / 1.0 / 1.3）
// 性別：過濾 speechSynthesis.getVoices()
//   female：優先選 name 含 'Samantha' | 'Google US English' | 'female'
//   male：優先選 name 含 'Alex' | 'male'
// 跨裝置支援：iOS Safari / Android Chrome / Chrome / Edge / Firefox
```

### 語音辨識（V1.2，ListeningQ 與練習頁使用）
```js
// 使用 window.SpeechRecognition || window.webkitSpeechRecognition
// lang: 'en-US'
// interimResults: false
// maxAlternatives: 1
// iOS 注意：需在 onClick 事件中直接呼叫 .start()，不可非同步呼叫
// 相似度計算：src/utils/similarity.js（Levenshtein distance）
// 合格門檻：>= 70%
// 合格回饋：「✅ 發音不錯！」（綠色）
// 不合格回饋：顯示「你說的：[辨識文字]」vs「正確：[範例句]」（紅色）
```

---

## 15. PWA 規格

```js
// vite.config.js 中配置 vite-plugin-pwa：
VitePWA({
  registerType: 'autoUpdate',
  manifest: {
    name: '旅遊英文學習 App',
    short_name: 'TravelSpeak',
    theme_color: '#0F1F3D',
    background_color: '#FAF7F2',
    display: 'standalone',
    icons: [{ src: '/icon-192.png', sizes: '192x192', type: 'image/png' }]
  }
})

// PWA 安裝 Banner 規則：
// - 監聽 beforeinstallprompt 事件
// - 顯示非侵入式 Banner（fixed，高度 64px）
//   手機版：bottom: var(--bottomnav-h)（緊貼 BottomNav 上方，不覆蓋）
//   桌面版：bottom: 0（無 BottomNav）
// - 關閉時寫入 localStorage: pwa_banner_dismissed = Date.now()
// - 30 天內不再顯示（讀取時判斷 Date.now() - dismissed < 30*24*60*60*1000）
```

---

## 16. 禁止事項速查（Cursor 每次生成前必須確認）

```
❌ 不可安裝 MUI / Ant Design / Chakra 等 UI 框架
❌ 不可在 JSX 中直接寫 localStorage.setItem / getItem
❌ 不可在英文句子中插入音標（音標必須獨立一行）
❌ 不可使用 Tailwind arbitrary values 定義顏色（如 bg-[#0F1F3D]）
❌ 不可在元件內硬編碼任何課程文字
❌ 不可新增規格外的目錄或檔案
❌ 不可使用 react-router-dom 以外的路由套件
❌ 不可讓功能鍵因捲動而消失（TopNav / BottomNav / ClozeToggle 必須 sticky/fixed）
❌ 不可讓「重置進度」或「清除資料」按鈕直接執行，必須先跳出確認 Dialog
❌ 不可讓未開發主題卡片可點擊
```

---

*SPEC.md V2.2 — 與企劃書 V2.2 同步 | 變更摘要：JSON 結構升級（sentence.type、sentence.audio、keywords.zh、options 雙語化、listening 單一來源）、KKAnnotation 三位一體渲染、SentenceCard 含 type/audio props、Tab URL query string 規格、audio_status localStorage key | 請勿單獨修改此檔案，任何規格變更須同步更新企劃書*
