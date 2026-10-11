# Bacon AI on your phone or iPad — beginner setup

Your phone does **not** run the AI. It is a remote control for the Bacon AI controller on your PC
(or cloud PC). The PC must be on, awake and running `Start.cmd` whenever you use Bacon AI.

Steps marked **[PC]** happen on the Windows laptop. Steps marked **[Phone]** happen on the phone/iPad.

## 1. Start Bacon AI on the PC  **[PC]**
1. Open the `Bacon-AI` folder.
2. First time only: double-click **`Setup.cmd`** and finish the Codex sign-in with your ChatGPT account.
3. Double-click **`Start.cmd`**. A window opens and shows a **Pairing token** (a long line of letters).
   Keep this window open. Closing it stops Bacon AI.

## 2. Give the PC a private, secure address  **[PC]**
1. Install **Tailscale** from https://tailscale.com/download and sign in (Google, Microsoft or Apple account).
2. Double-click **`Enable-Remote.cmd`**. It prints an address like
   `https://my-pc.tailnet-name.ts.net`. Write it down. This is your **controller address**.
3. Close and reopen `Start.cmd` so it uses the new address.

Only devices signed into *your* Tailscale account can reach this address. Nothing is published to the public internet.

## 3. Put the phone on the same private network  **[Phone]**
1. Install the **Tailscale** app (App Store / Google Play).
2. Sign in with the **same account** you used on the PC. Turn the VPN switch **on**.

## 4. Open Bacon AI  **[Phone]**
Choose **one** option:

**A. Straight from the PC (simplest).** In Safari/Chrome open your controller address
(`https://my-pc.tailnet-name.ts.net`). Paste the pairing token when asked.

**B. From the Bacon AI website.** Open the website address you were given (for example
`https://<your-name>.github.io/bacon-ai/`). When it asks:
- **Controller address:** `https://my-pc.tailnet-name.ts.net`
- **Pairing token:** the token from the `Start.cmd` window

Option B needs one extra step on the PC  **[PC]**: double-click **`Allow-Website.cmd`**, type the
website's address (just `https://<your-name>.github.io`, no path), then restart `Start.cmd`.

The address and token are saved only in that phone's browser. Tap **Re-pair** to change them.

## 5. Add it to your Home Screen  **[Phone]**
- **iPhone/iPad (Safari):** tap **Share ⬆︎** → **Add to Home Screen** → **Add**.
- **Android (Chrome):** tap **⋮** → **Install app** (or **Add to Home screen**).

Now Bacon AI opens full-screen like a normal app.

## Troubleshooting
| Message | Fix |
|---|---|
| “Can’t reach your controller” | PC on and awake? `Start.cmd` window open? Tailscale **on** on the phone? |
| “browsers block plain http:// controllers” | Use the `https://….ts.net` address from `Enable-Remote.cmd`, not an `http://` or `127.0.0.1` address. |
| “Enter the pairing token” / 401 | Copy the token again from the `Start.cmd` window. It changes only if you delete `data/token.txt`. |
| “Cross-origin request denied” | Website not allowed yet. Run `Allow-Website.cmd` on the PC with the exact website address, then restart `Start.cmd`. |
| “Host not allowed” | Run `Enable-Remote.cmd` again, then restart `Start.cmd`. |

## Hosting the website yourself (optional)  **[PC]**
1. Run `py -3 scripts\build_web.py`. This creates the `web/` folder (static files only, no secrets).
2. Upload the *contents* of `web/` to GitHub Pages or Cloudflare Pages (both free).
3. Run `Allow-Website.cmd` with the site's origin, then restart `Start.cmd`.

## Saved connections (one tap)
The first time, enter the address plus a pairing token or family account. After that, the connect
screen shows a big button for each saved connection, such as **💻 My PC** or **☁️ Oracle cloud**.
Bacon AI reconnects to the last one you used when it opens. Tap **Switch** at the top to change.
Use ✎ to edit a connection and ✕ to forget it on that device. Saved logins stay only in that browser,
and tokens are never put in links.

**☁️ Continue with ChatGPT only** connects to your saved cloud server and switches it to ChatGPT-only
Brain Mode. ChatGPT Plus needs that always-on server; see `docs/ORACLE-FREE.md`.

## Family accounts
- Family members choose **Connect my PC → Family account → Create account** (email + password).
- New accounts stay **pending** until you approve them in **Control center → 👪 Accounts**, so
  someone with the link can't use your AI. Each person gets their own chats, projects and bots.
- **Sign-up needs email set up.** Run `py -3 scripts\setup_email.py` (or `python3 scripts/setup_email.py` on the server)
  once, using an app password for your mail account. Until you do, sign-up stays off with a clear message.
- Sign-up emails the person a **6-digit code**. They enter it in the app (it expires in 15 minutes, they get 5 tries,
  and **Resend code** works once a minute). The account only exists after the right code, so every address is real.
- Then you get an email for the new sign-up with **Approve / Decline** links. The links are signed, work once and expire
  after 48 hours. Opening one only shows a confirmation: you must be signed in as the owner and press **Confirm**.
- You can set a personal **cloud calls per day** limit for each person. Only you see the shared ChatGPT allowance.
- **Ban** blocks the account, every browser it used, and its Tailscale identity (when Tailscale reports one).
  Be aware that a browser device ID can be cleared by someone determined. The Tailscale block is the
  strong layer, and you can also remove their device in the Tailscale admin console. If a family member
  uses *your* Tailscale login, banning cannot tell their device apart from yours, so give each person
  their own Tailscale account (or share your PC with them from the Tailscale console).
- Your pairing token always works for you, even on a blocked device.
