# Bacon AI on your Windows laptop: quick start

You need this once, on the laptop. It takes about 20–30 minutes, mostly waiting for downloads.
After that, starting Bacon AI is just **double-click `Start.cmd`**.

## 1. Install the four tools (once)
Install each one, accepting the defaults:

1. **Python 3.11 or newer**: https://www.python.org/downloads/windows/
   On the first installer screen, tick **"Add python.exe to PATH"**.
2. **Ollama** (runs AI on your laptop's GPU): https://ollama.com/download/windows
3. **Node.js LTS**: https://nodejs.org/
4. **Codex** (official ChatGPT sign-in for coding). Open **Command Prompt** (press Start, type `cmd`, press Enter) and run:
   ```
   npm install -g @openai/codex
   ```
   Close that window when it finishes.

## 2. Set up Bacon AI (once)
1. Unzip `Bacon-AI-updated.zip` somewhere easy, such as `Documents\Bacon-AI`.
2. Double-click **`Setup.cmd`**. It downloads the local coding model (`qwen2.5-coder:7b`, ~4.7 GB) and
   opens the **Codex sign-in**: log in with your ChatGPT account in the browser.
   - If sign-in didn't open, run `codex login` in Command Prompt.
3. Wait for "Setup finished".

## 3. Start it (every time)
1. Double-click **`Start.cmd`**. Leave the black window open: closing it stops Bacon AI.
2. The window shows **`Pairing token: …`**. Select the text, right-click to copy it, and keep it private.
3. On the laptop, open http://127.0.0.1:8765, click **Connect**, and paste the token.

## 4. Use it from your phone or iPad (once)
1. Install **Tailscale** on the laptop (https://tailscale.com/download) and sign in.
2. Double-click **`Enable-Remote.cmd`**. It prints your private address, like `https://my-laptop.tail1234.ts.net`.
3. Double-click **`Allow-Website.cmd`** and type exactly: `https://bacom21017.github.io`
4. Close the `Start.cmd` window and double-click `Start.cmd` again.
5. On the phone: install the **Tailscale** app with the **same account**, then open
   **https://bacom21017.github.io/bacon-ai/** and enter the address from step 2 plus the token.
   (Full phone steps: `docs/PHONE-SETUP.md`.)

## 5. Keep the laptop awake
Your phone can only reach Bacon AI while the laptop is **on, awake and online**.
- Keep it **plugged in**.
- Double-click **`Keep-Awake.cmd`** (optional). When plugged in it sets sleep and hibernate to *Never* and makes closing the lid do nothing. Battery settings are not touched.
  - Or do it by hand: **Settings → System → Power & battery → Screen and sleep → "When plugged in, put my device to sleep after" → Never**.
- Leave room for air. Don't run it closed inside a bag. Bacon AI pauses itself if the GPU or CPU gets too hot.

## 6. Start automatically (optional)
Double-click **`Autostart.cmd`**. Bacon AI then starts (minimised) every time you sign in to Windows.
This needs no admin rights. To undo it, open Command Prompt in the folder and run `Autostart.cmd remove`.

## Choosing the brain
In **Control center → 🧠 Brain**:
- **Hybrid** (default): laptop GPU + ChatGPT together. The split slider (presets 10/40/60/90%) is a routing target, not a guaranteed split.
- **ChatGPT only**: no local model. Light on the laptop, but uses your ChatGPT allowance.
- **PC only**: only Ollama. Never uses ChatGPT.
- **Brain power**: Light, Balanced or Max (how much of the cloud budget to use, plus Codex reasoning effort).
- **Local model**: models that fit your GPU are marked. `qwen2.5-coder:7b` is recommended for 8 GB laptop GPUs such as the RTX 5060.

## If something goes wrong
| Problem | Fix |
|---|---|
| "Install Python…" | Reinstall Python with **Add to PATH** ticked, then restart the laptop. |
| "Install Node.js…" / `codex` not found | Install Node.js, open a **new** Command Prompt, run `npm install -g @openai/codex`. |
| "Ollama is not reachable" | Open the Ollama app (llama icon by the clock). |
| "Port 8765 is busy" | Bacon AI is already running. Close the other `Start.cmd` window. |
| Phone can't connect | Laptop awake? `Start.cmd` open? Tailscale on, on **both** devices? |
