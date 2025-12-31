# How to Use Your Existing Images for Open Graph

## ✅ Perfect! Your Existing Images Work Great!

Since you already have images created with Photoshop/Photopea for Facebook and Instagram, you can use them! Just need to resize them to the correct dimensions.

## 📐 Requirements

- **Size**: 1200 x 630 pixels (exact)
- **Format**: JPG (recommended) or PNG
- **File name**: `og-image.jpg`
- **Location**: `/public/og-image.jpg` in your project

## 🎨 Using Photoshop

### Step 1: Open Your Existing Image
1. Open Photoshop
2. Open your existing social media image

### Step 2: Resize to 1200x630
1. Go to **Image → Image Size** (or press `Ctrl+Alt+I` / `Cmd+Option+I`)
2. Make sure "Constrain Proportions" is **UNCHECKED** (important!)
3. Set width to **1200** pixels
4. Set height to **630** pixels
5. Click **OK**

### Step 3: Adjust if Needed
- If your image looks stretched, you might need to:
  - Crop it to the right aspect ratio first
  - Or add background/borders to fit the dimensions
  - Or create a new composition with your logo on a 1200x630 canvas

### Step 4: Export
1. Go to **File → Export → Export As...**
2. Choose **JPG** format
3. Quality: **80-90%** (good balance of quality and file size)
4. Name it: `og-image.jpg`
5. Save to your project's `/public/` folder

## 🎨 Using Photopea (Free Alternative)

### Step 1: Open Your Image
1. Go to https://www.photopea.com
2. Open your existing image: **File → Open**

### Step 2: Resize
1. Go to **Image → Canvas Size**
2. Set width: **1200 px**
3. Set height: **630 px**
4. Click **OK**

### Step 3: Adjust
- If needed, use the **Crop Tool** to adjust the composition
- Make sure your logo and branding are centered and visible

### Step 4: Export
1. Go to **File → Export As → JPG**
2. Quality: **80-90%**
3. Download
4. Rename to `og-image.jpg`
5. Place in `/public/` folder

## 💡 Pro Tips

### If Your Image is a Different Size:
- **Square images (1:1)**: Add borders/padding to make 1200x630
- **Vertical images**: Crop or create new composition
- **Wide images**: Crop to center the important content

### Best Practices:
- ✅ Keep important content (logo, text) in the center
- ✅ Use high contrast colors for visibility
- ✅ Keep file size under 1MB (JPG compression helps)
- ✅ Test how it looks on Facebook/Twitter after uploading

### Quick Check:
After creating the image:
1. File size should be: **50KB - 500KB** (ideally)
2. Dimensions: Exactly **1200 x 630 pixels**
3. Format: **JPG** (or PNG if you need transparency)

## 🚀 After Creating the Image

1. Place the file in: `/public/og-image.jpg`
2. Restart your dev server (if running)
3. Test it:
   - Go to https://developers.facebook.com/tools/debug/
   - Enter your website URL
   - Click "Scrape Again"
   - You should see your image in the preview!

## ✅ That's It!

Your existing images from Photoshop/Photopea are perfect - just resize them to 1200x630 and you're done!

**No need to use Canva** if you already have professional images! 🎉






















