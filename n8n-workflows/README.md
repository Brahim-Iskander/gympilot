# 🚀 GymPilot: Instagram Story to Shop & Social Pipeline

Automated n8n workflow that ingests Instagram stories/posts (via Apify or webhook), parses products and promotional packs with Google Gemini AI, generates ultra-realistic studio 3D product visuals with AI (Pollinations Flux engine), automatically registers them into the GymPilot database/Boutique, and publishes the new pack/product to your Instagram feed!

---

## 🌟 Workflow Highlights

1. **Triggering**:
   - **Cron**: Runs every hour to scrape stories from targeted Instagram accounts.
   - **Manual Webhook**: Supports instant on-demand ingestion: `POST /webhook/instagram-story`.
2. **AI Classification & Extraction**:
   - Uses **Google Gemini** to extract product/pack titles, pricing (TND), descriptions, flavors, dosage, and categories (`PROTEIN`, `CREATINE`, `PRE_WORKOUT`, `AMINO_ACIDS`, etc.).
   - Built-in retry mechanism with 2000ms delay to prevent 429 rate limit errors.
3. **🎨 AI Image Generation (Pollinations Flux)**:
   - Evaluates whether it's a single supplement or a multipack/bundle.
   - Dynamically crafts a prompt for **Flux 3D commercial e-commerce studio photography** (dark studio, gym lighting, neon accents, 4k ultra-detailed).
   - Generates high-resolution 1024x1024 JPEG without requiring any paid API key.
   - Saves the AI visual as the primary image (`images[0]`) and preserves the original story snapshot as fallback (`images[1]`).
4. **GymPilot Shop Ingestion**:
   - Authenticates as GymPilot Admin to obtain a JWT token.
   - Creates the **Product** or promotional **Pack** in the database with stock, discount percentage, category mapping, and images.
5. **📸 Automated Instagram Feed Publication**:
   - Auto-formats an engaging Instagram caption with pricing, savings badge, bullet points, call-to-action, and hashtags.
   - Calls the **Meta Instagram Graph API** (`/v21.0/{ig-user-id}/media` and `/media_publish`).
   - Gracefully continues (`continueOnFail: true`) if Instagram credentials are not configured yet, ensuring GymPilot product creation is never blocked.

---

## ⚙️ Configuration & Credentials

### 1. Environment Variables / n8n Credentials

Configure the following variables in your n8n environment (`.env` or Docker configuration):

| Variable | Description | Example |
| :--- | :--- | :--- |
| `GYMPILOT_API_URL` | Backend URL for GymPilot | `https://api.gympilot.tn` |
| `GYMPILOT_ADMIN_EMAIL` | Admin email to obtain JWT | `admin@gympilot.tn` |
| `GYMPILOT_ADMIN_PASSWORD` | Admin password | `AdminSecret123!` |
| `GEMINI_API_KEY` | Google Gemini API Key | `AIzaSy...` |
| `APIFY_API_TOKEN` | Apify token for Instagram scraping | `apify_api_...` |
| `INSTAGRAM_ACCOUNT_ID` | Instagram Business / Creator Account ID | `17841400000000000` |
| `INSTAGRAM_ACCESS_TOKEN` | Meta User or Page Long-Lived Token | `EAA...` |

> 💡 **Tip:** You can also edit the parameters directly inside the n8n node settings if you prefer not using environment variables.

---

## 📲 Setting Up Instagram Auto-Posting (Meta Graph API)

To allow the workflow to post packs and products to your Instagram feed automatically:

1. Convert your Instagram account to a **Professional / Business Account**.
2. Connect your Instagram account to a **Facebook Page**.
3. Create an app on [developers.facebook.com](https://developers.facebook.com):
   - Type: **Business**
   - Add product: **Instagram Graph API**
4. In Graph API Explorer, request the permissions:
   - `instagram_basic`
   - `instagram_content_publish`
   - `pages_read_engagement`
   - `pages_show_list`
5. Generate a **Long-Lived Page Access Token**.
6. Find your Instagram Account ID using:
   ```bash
   GET https://graph.facebook.com/v21.0/me/accounts?access_token=YOUR_USER_TOKEN
   # Find your page id, then:
   GET https://graph.facebook.com/v21.0/{page-id}?fields=instagram_business_account&access_token=YOUR_USER_TOKEN
   ```
7. Put `INSTAGRAM_ACCOUNT_ID` and `INSTAGRAM_ACCESS_TOKEN` into your n8n environment.

---

## 🚀 How to Import into n8n

1. Open your n8n Dashboard.
2. Click **Add workflow** > **Import from File...**
3. Select `instagram-to-gympilot.json`.
4. Click **Save** and **Activate**.
