# 🎯 Blog System - Complete Setup Guide

## 📚 Tổng Quan Blog System

```
┌─────────────────────────────────────────────────┐
│           BLOG SYSTEM ARCHITECTURE              │
├─────────────────────────────────────────────────┤
│                                                 │
│  Supabase (Database)                            │
│  └─ blogs table (15 articles)                  │
│                                                 │
│  Services                                       │
│  └─ blogService.ts: getBlogs()                 │
│                                                 │
│  Screens                                        │
│  ├─ AllBlogsScreen.tsx (List view)             │
│  └─ BlogDetailScreen.tsx (Detail view)         │
│                                                 │
│  Navigation                                     │
│  └─ AllBlogsScreen → BlogDetailScreen          │
│                                                 │
└─────────────────────────────────────────────────┘
```

## 🗂️ File Structure

```
Mobile-BTL-Nhom25/
├── services/
│   └── blogService.ts         ← Fetch blogs
├── screens/
│   ├── AllBlogsScreen.tsx     ← List all blogs
│   ├── BlogDetailScreen.tsx   ← Blog details
│   └── ExploreScreen.tsx      ← Tab linking to AllBlogsScreen
├── SQL Files/
│   ├── CREATE_BLOGS_TABLE.sql ← Create table structure
│   ├── INSERT_BLOG_DATA.sql   ← Insert 15 blog posts
│   └── DATABASE_QUERIES.sql   ← Check & verify
└── Docs/
    └── BLOG_DATA_SETUP.md     ← This guide
```

## 🚀 SETUP STEPS (Quick Start)

### Phase 1: Database Setup (2 minutes)

#### Step 1.1: Create Table
```
File: CREATE_BLOGS_TABLE.sql
Location: Supabase > SQL Editor

1. Copy entire CREATE_BLOGS_TABLE.sql
2. Paste in SQL Editor
3. Run
4. ✅ Table created with 5 fields:
   - id (BIGSERIAL PRIMARY KEY)
   - tieude (VARCHAR 255)
   - hinhanh (TEXT - image URL)
   - loai (VARCHAR 50 - category)
   - luongxem (INTEGER - view count)
   - ngaytao (TIMESTAMP - created date)
   - noidung (TEXT - content)
```

#### Step 1.2: Insert Data
```
File: INSERT_BLOG_DATA.sql
Location: Supabase > SQL Editor

1. Copy entire INSERT_BLOG_DATA.sql
2. Paste in SQL Editor (or new Query)
3. Run
4. ✅ 15 blog posts inserted
   - Check: SELECT COUNT(*) FROM blogs;
   - Result: 15 rows
```

### Phase 2: Verify Data (1 minute)

```sql
-- Run these queries to verify:

-- Total blogs
SELECT COUNT(*) FROM blogs;
-- Expected: 15

-- By category
SELECT loai, COUNT(*) FROM blogs GROUP BY loai;
-- Expected: 
--   Bước: 2
--   Nhịp Tim: 1
--   Dinh Dưỡng: 3
--   Giấc Ngủ: 3
--   Chu Kỳ: 3
--   Sức Khỏe: 3

-- Latest blog
SELECT tieude, ngaytao FROM blogs ORDER BY ngaytao DESC LIMIT 1;
-- Expected: "Chu Kỳ Giấc Ngủ REM và NREM..."
```

### Phase 3: Test In App (2 minutes)

```
1. Open app
2. Navigate to Explore tab
3. Tap "Tất Cả Blog"
4. ✅ See 15 blog cards:
   - Each has thumbnail image
   - Title
   - Category tag
   - View count
   - Date

5. Tap any blog
6. ✅ BlogDetailScreen shows:
   - Full image
   - Title
   - Category + view count
   - Content
   - Related blogs (same category)
```

## 📊 Data Structure

### Blogs Table Schema

```sql
CREATE TABLE blogs (
  id BIGSERIAL PRIMARY KEY,
  tieude VARCHAR(255) NOT NULL,           -- "Đi Bộ 10,000 Bước..."
  hinhanh TEXT NOT NULL,                  -- "https://images.unsplash.com/..."
  loai VARCHAR(50) NOT NULL,              -- "Bước", "Dinh Dưỡng", etc.
  luongxem INTEGER DEFAULT 0,             -- 2145, 3421, etc.
  ngaytao TIMESTAMP DEFAULT NOW(),        -- 2025-11-16 10:30:00
  noidung TEXT,                           -- Full article content
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### Sample Record

```json
{
  "id": 1,
  "tieude": "Đi Bộ 10,000 Bước Mỗi Ngày - Bí Quyết Sống Lâu",
  "hinhanh": "https://images.unsplash.com/photo-1552196881-acbed25f4b34?w=500&h=300&fit=crop",
  "loai": "Bước",
  "luongxem": 2145,
  "ngaytao": "2025-11-01",
  "noidung": "Đi bộ là hoạt động tập thể dục đơn giản nhưng hiệu quả cao..."
}
```

## 🎨 UI/UX Flow

### AllBlogsScreen (List View)

```
┌──────────────────────────────────────────┐
│ ‹  All Blogs                        ◻    │
├──────────────────────────────────────────┤
│                                          │
│  ┌────────────────────────────────────┐  │
│  │ [Image: Runner]                    │  │
│  ├────────────────────────────────────┤  │
│  │ Bước                               │  │
│  │ Đi Bộ 10,000 Bước Mỗi Ngày         │  │
│  │ 👁 2,145 • Nov 1                   │  │
│  └────────────────────────────────────┘  │
│                                          │
│  ┌────────────────────────────────────┐  │
│  │ [Image: Smartwatch]                │  │
│  ├────────────────────────────────────┤  │
│  │ Nhịp Tim                           │  │
│  │ Kiểm Tra Sự Kiện Tim Đập Nhanh...  │  │
│  │ 👁 3,421 • Nov 6                   │  │
│  └────────────────────────────────────┘  │
│                                          │
│  [Scroll down for 13 more blogs...]      │
│                                          │
└──────────────────────────────────────────┘
```

### BlogDetailScreen (Detail View)

```
┌──────────────────────────────────────────┐
│ ‹        BlogDetailScreen               │
├──────────────────────────────────────────┤
│                                          │
│     [Full Image: Runner - 300x200]       │
│                                          │
│  Bước  👁 2,145 views  Nov 1             │
│                                          │
│  Đi Bộ 10,000 Bước Mỗi Ngày -           │
│  Bí Quyết Sống Lâu                      │
│                                          │
│  ─────────────────────────────────────  │
│                                          │
│  Đi bộ là hoạt động tập thể dục đơn     │
│  giản nhưng hiệu quả cao. Mục tiêu      │
│  10,000 bước mỗi ngày giúp cải thiện    │
│  sức khỏe tim mạch, giảm cân và tăng    │
│  sức bền...                             │
│                                          │
│  ─────────────────────────────────────  │
│                                          │
│  Related Posts                           │
│  ┌──────────────────────────────────┐   │
│  │ [Img] Cách Tính Calories Đốt...  │   │
│  │ 👁 1,856 • Nov 4                  │   │
│  └──────────────────────────────────┘   │
│                                          │
│  [More related blogs...]                 │
│                                          │
└──────────────────────────────────────────┘
```

## 🏷️ Blog Categories

```
┌─────────────────┬──────────┬────────────┐
│ Category        │ Count    │ Total Views│
├─────────────────┼──────────┼────────────┤
│ Chu Kỳ (Cycle)  │ 3 posts  │ 11,255    │
│ Dinh Dưỡng      │ 3 posts  │ 8,797     │
│ Sức Khỏe        │ 3 posts  │ 10,742    │
│ Giấc Ngủ (Sleep)│ 3 posts  │ 8,308     │
│ Bước (Steps)    │ 2 posts  │ 4,001     │
│ Nhịp Tim (Heart)│ 1 post   │ 3,421     │
├─────────────────┼──────────┼────────────┤
│ TOTAL           │ 15 posts │ 46,524    │
└─────────────────┴──────────┴────────────┘
```

## 🖼️ Image Sources

All images from **Unsplash** (Free & High Quality):

**Features:**
- ✅ Free to use (no attribution required)
- ✅ High resolution (2000+ x 1200+ px)
- ✅ Health & wellness themed
- ✅ Already optimized URLs with size parameters
- ✅ HTTPS secure links

**URL Format:**
```
https://images.unsplash.com/photo-[ID]?w=500&h=300&fit=crop
                                        ↑     ↑     ↑
                                    Width Height Crop
```

## 🔄 How It Works

### 1️⃣ User Opens App

```
Home Screen
    ↓
User navigates to Explore tab
    ↓
Sees "Tất Cả Blog" button
```

### 2️⃣ User Taps "Tất Cả Blog"

```
AllBlogsScreen component mounts
    ↓
useEffect triggers
    ↓
blogService.getBlogs() called
    ↓
Supabase query: SELECT * FROM blogs
    ↓
Returns 15 blog posts
    ↓
setBlogs(data) → Component re-renders
    ↓
User sees list of 15 blogs
```

### 3️⃣ User Taps a Blog Card

```
TouchableOpacity onPress
    ↓
navigation.navigate("BlogDetailScreen", {
  title: "Đi Bộ 10,000 Bước...",
  tag: "Bước",
  views: 2145,
  image: "https://images.unsplash.com/...",
  content: "Đi bộ là hoạt động..."
})
    ↓
BlogDetailScreen component mounts
    ↓
route.params extracted
    ↓
Display blog details:
  - Full image
  - Title
  - Category + views
  - Content
  - Related blogs (same category)
```

### 4️⃣ Related Blogs Load

```
BlogDetailScreen useEffect
    ↓
Query: SELECT * FROM blogs WHERE loai = tag AND tieude != title
    ↓
Fetch up to 5 related posts
    ↓
Display as horizontal/vertical list
    ↓
User can tap to navigate to that blog
```

## ✅ Complete Checklist

### Database Setup
- [ ] Created `blogs` table in Supabase
- [ ] Added columns: tieude, hinhanh, loai, luongxem, ngaytao, noidung
- [ ] Inserted 15 blog posts
- [ ] Verified: `SELECT COUNT(*) FROM blogs` = 15

### Code Integration
- [ ] blogService.ts has getBlogs() function
- [ ] AllBlogsScreen fetches and displays blogs
- [ ] BlogDetailScreen shows blog details
- [ ] Navigation between screens works
- [ ] Related blogs load correctly

### Testing
- [ ] App loads without errors
- [ ] AllBlogsScreen shows 15 blog cards
- [ ] Images load properly from Unsplash
- [ ] Tapping blog → BlogDetailScreen loads
- [ ] Related blogs appear correctly
- [ ] Can navigate back without issues

### Content Quality
- [ ] All titles are in Vietnamese
- [ ] All content is health-related
- [ ] View counts are realistic (1k-5k)
- [ ] Dates are varied (spread across 15 days)
- [ ] Categories are consistent (6 types)

## 🆘 Troubleshooting

### ❌ Blogs table doesn't exist

```
✅ Solution: Run CREATE_BLOGS_TABLE.sql
   File: CREATE_BLOGS_TABLE.sql
   Location: Supabase > SQL Editor
```

### ❌ No data shows in AllBlogsScreen

```
✅ Solution 1: Run INSERT_BLOG_DATA.sql
   Make sure you see "15 rows affected"

✅ Solution 2: Check RLS policies
   - AllBlogsScreen needs read permission
   - SQL: ALTER TABLE blogs DISABLE ROW LEVEL SECURITY;
   
✅ Solution 3: Verify in Supabase Console
   - Go to: Data Editor > blogs
   - Should see 15 rows
```

### ❌ Images not loading

```
✅ Solution 1: Check network connection
   Make sure device has internet

✅ Solution 2: Verify image URLs
   - Copy URL from INSERT_BLOG_DATA.sql
   - Paste in browser
   - Should load image

✅ Solution 3: Check CORS
   - Unsplash images are CORS-enabled
   - Should work with React Native
```

### ❌ Navigation fails

```
✅ Solution 1: Check route name
   - BlogDetailScreen in navigation config
   
✅ Solution 2: Verify params passed
   - title, tag, views, image, content required
   - Check AllBlogsScreen navigation.navigate()

✅ Solution 3: Check React Navigation version
   - Should be @react-navigation/native
```

## 📱 Testing Checklist

- [ ] Open app
- [ ] Navigate to Explore → All Blogs
- [ ] Verify 15 blog cards load
- [ ] Check images display correctly
- [ ] Verify blog count matches categories
- [ ] Tap blog → Detail screen loads
- [ ] Verify image loads in detail screen
- [ ] Verify content displays correctly
- [ ] Scroll down for related posts
- [ ] Tap related post → navigates correctly
- [ ] Navigate back without errors

## 🎓 Key Files Summary

| File | Purpose | Status |
|------|---------|--------|
| CREATE_BLOGS_TABLE.sql | Create database table | ✅ Ready |
| INSERT_BLOG_DATA.sql | Insert 15 blog posts | ✅ Ready |
| blogService.ts | Fetch blogs from DB | ✅ Ready |
| AllBlogsScreen.tsx | Display blog list | ✅ Ready |
| BlogDetailScreen.tsx | Display blog details | ✅ Ready |

## 🚀 Next Steps

1. **Run SQL Scripts** (5 minutes)
   - Execute CREATE_BLOGS_TABLE.sql
   - Execute INSERT_BLOG_DATA.sql
   - Verify data exists

2. **Test in App** (5 minutes)
   - Open app and navigate to blogs
   - Verify all 15 blogs appear
   - Tap and verify detail screen

3. **Customization** (Optional)
   - Edit blog content as needed
   - Add more blogs with similar structure
   - Change images if desired

4. **Deployment** (When ready)
   - Commit changes to git
   - Test on device/emulator
   - Deploy to production

---

**That's it! Your blog system is ready! 🎉**
