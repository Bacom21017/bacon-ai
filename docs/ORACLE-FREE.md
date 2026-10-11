# Free always-on Bacon AI with Oracle Cloud "Always Free" (from your iPad)

This gives you a small Linux server that stays on, so you can use Bacon AI with the **laptop off**.
Free servers have **no GPU**, so Bacon AI runs in **ChatGPT only** Brain Mode (cloud brain through your own
ChatGPT/Codex sign-in). Everything below works in Safari on an iPad.

> **Costs and caveats, read first**
> - Oracle needs a **credit/debit card** to verify identity. Always Free resources cost $0 only while you stay
>   inside the Always Free limits. Do **not** click "Upgrade to Pay As You Go" unless you want paid resources.
> - Pick shapes marked **"Always Free-eligible"**. Free ARM capacity is sometimes "out of capacity"; retry later or try another availability domain.
> - Oracle may reclaim **idle** Always Free instances. Using Bacon AI regularly counts as activity.
> - Your ChatGPT plan limits still apply. Bacon AI never switches to paid API billing by itself.

## 1. Create the account
1. Go to https://www.oracle.com/cloud/free/ → **Start for free**.
2. Choose a **home region** near you. It can't be changed later.
3. Finish card verification.

## 2. Create the server (about 5 min)
1. In the Oracle console: **☰ → Compute → Instances → Create instance**.
2. **Image:** *Canonical Ubuntu 24.04* (22.04 also works).
3. **Shape:** *Change shape* → **Ampere (ARM) VM.Standard.A1.Flex**, 1–2 OCPU and 6–12 GB RAM
   (all within Always Free). If ARM is out of capacity, use **AMD VM.Standard.E2.1.Micro** (1 GB RAM; slower but fine for ChatGPT-only).
4. **Networking:** keep the defaults (public subnet).
5. **SSH keys:** choose **"Generate a key pair for me"** and download both keys (Files app). Or skip, because Cloud Shell below works without them.
6. Click **Create**. Wait for **Running** and note the **Public IP**.

You do **not** need to open any firewall ports. Bacon AI is reached privately through Tailscale.

## 3. Open a terminal from the iPad
Easiest: the **Cloud Shell** icon (`>_`) at the top right of the Oracle console. Then:
```
ssh -i <your-private-key-file> ubuntu@<PUBLIC_IP>
```
(Upload the key to Cloud Shell with its ⚙ menu → Upload, then `chmod 600 <file>`.)
Alternative: an SSH app such as Termius or Blink with the downloaded key.

## 4. Install the prerequisites (copy-paste, about 5 min)
```
sudo apt update && sudo apt -y upgrade
sudo apt -y install python3 git unzip curl
curl -fsSL https://deb.nodesource.com/setup_lts.x | sudo -E bash -
sudo apt -y install nodejs
sudo npm install -g @openai/codex
curl -fsSL https://tailscale.com/install.sh | sh
sudo tailscale up            # open the printed link and sign in with YOUR Tailscale account
sudo tailscale set --operator=$USER
```

## 5. Copy Bacon AI to the server
Either upload `Bacon-AI-updated.zip` with Cloud Shell's ⚙ → Upload and `scp` it to the server, or
download it from wherever you keep it. Then:
```
mkdir -p ~/Bacon-AI && cd ~/Bacon-AI && unzip -o ~/Bacon-AI-updated.zip
```

## 6. Run the setup script
```
cd ~/Bacon-AI
bash deploy/Setup-Cloud-PC.sh --name="Oracle Free"
```
The script:
- Checks Python, Codex, systemd and Tailscale. It works on ARM (aarch64) and x86.
- Sets **Brain Mode = ChatGPT only** (default; no Ollama needed). Use `--with-ollama` only on a machine that can run local models.
- Runs the self-tests.
- Starts **Codex device sign-in** (`codex login --device-auth`): open the printed URL on your iPad, enter the code and sign in with ChatGPT.
- Installs a per-user service, enables the private Tailscale HTTPS address, and prints your **pairing token**.

Then keep it running after you log out, and allow the website:
```
sudo loginctl enable-linger "$USER"
python3 scripts/allow_website.py https://bacom21017.github.io && systemctl --user restart bacon-ai
```

## 7. Connect from the iPad
1. Install the **Tailscale** app and sign in with the **same** account. Turn it on.
2. Open **https://bacom21017.github.io/bacon-ai/**.
3. Enter the server's address (`https://<server>.<tailnet>.ts.net`, printed by the script) and the pairing token.
4. Share → **Add to Home Screen**.

## Useful commands
| Task | Command |
|---|---|
| Status | `systemctl --user status bacon-ai` |
| Logs | `journalctl --user -u bacon-ai -n 50` |
| Restart | `systemctl --user restart bacon-ai` |
| Show token again | `python3 scripts/cloud_pc.py pair` |
| Codex sign-in again | `codex -c 'forced_login_method="chatgpt"' login --device-auth` |

## Notes
- **ChatGPT only** never calls a local model. When your ChatGPT limit is reached, Bacon AI asks whether to switch to local (not useful on a GPU-less server) or **pause until the limit resets**. Choose pause here.
- Project files live on the server under `~/.local/share/BaconAI/data/projects`. Download them from **Project files → Download project ZIP**.
- Running code (tests) on the server happens only after you approve it in the app.
