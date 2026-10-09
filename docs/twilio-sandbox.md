# Twilio WhatsApp Sandbox — Team Guide

> **Project:** LoanHer (Hackaholics 7.0 prototype · Wema Bank)  
> **Purpose:** Quickstart guide for setting up, joining, testing, and troubleshooting the Twilio WhatsApp Sandbox.

---

## 1. How to Find the Sandbox Number and Join Code

The Twilio WhatsApp sandbox allows testing WhatsApp bots without waiting for Meta WhatsApp Business approval or purchasing a dedicated business number.

1. Go to the [Twilio Console](https://console.twilio.com) and log in.
2. In the left-hand navigation sidebar, go to:  
   **Develop** &rarr; **Messaging** &rarr; **Try it out** &rarr; **Send a WhatsApp message**  
   *(Direct link: `https://console.twilio.com/us1/develop/sms/try-it-out/whatsapp-learn`)*
3. In the **Sandbox** tab, locate:
   - **Sandbox Phone Number:** Typically `+1 415 523 8886` (`whatsapp:+14155238886`).
   - **Sandbox Join Code:** A unique phrase starting with `join`, followed by two words (e.g., `join brave-otter` or `join table-planet`).
4. Copy these two values and share the join code in your team chat.

---

## 2. How Every Team Member Joins

Because this is a shared sandbox, **every team member and tester must opt in before receiving any message**. Twilio will reject messages sent to unjoined numbers.

1. **Save Contact:** Save the Twilio Sandbox number (`+1 415 523 8886`) in your mobile phone contacts (e.g. as *"LoanHer Sandbox Bot"*).
2. **Open WhatsApp:** Open WhatsApp on your phone or desktop.
3. **Start Chat:** Start a new chat with `+1 415 523 8886`.
4. **Send Join Message:** Send the exact join code (e.g., `join brave-otter`).
5. **Receive Confirmation:** Twilio will immediately reply with:
   > *"You are all set! The sandbox will now send and receive messages from this channel. Reply 'stop' to leave."*
6. You are now active in the sandbox and can send/receive bot messages.

---

## 3. How to Run the Test Script

A command-line test script is provided in `backend/scripts/send_test_message.py` to verify Twilio connectivity, authentication, and recipient delivery.

### Step 3.1: Environment Configuration
Ensure your `backend/.env` file exists and contains valid Twilio credentials (copied from `backend/.env.example`):

```env
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your_twilio_auth_token_here
TWILIO_WHATSAPP_FROM=whatsapp:+14155238886
```

> **Security Note:** Never commit `backend/.env` to Git and never print or share the auth token.

### Step 3.2: Activate Virtual Environment
```bash
# Windows (PowerShell)
.loanHerVenv\Scripts\activate

# macOS / Linux
source .loanHerVenv/bin/activate
```

### Step 3.3: Run the Script
From the `backend/` directory:

```bash
# Using standard international format:
python scripts/send_test_message.py +2348031234567 "Hello from LoanHer"

# Using Nigerian local format (automatically converted to +234):
python scripts/send_test_message.py 08031234567 "Hello from LoanHer"

# Using Twilio WhatsApp URI format:
python scripts/send_test_message.py whatsapp:+2348031234567 "Hello from LoanHer"
```

*(Note: The script can also be run from the repository root: `python backend/scripts/send_test_message.py 08031234567 "Hello from LoanHer"`)*

### Expected Success Output:
```text
Sending WhatsApp sandbox message...
  To   : whatsapp:+2348031234567
  From : whatsapp:+14155238886
  Body : 'Hello from LoanHer'

Message sent successfully!
  Message SID : SM1234567890abcdef1234567890abcdef
  Status      : queued
```

---

## 4. Sandbox Limits & Constraints

Keep these Twilio sandbox limits in mind during development and hackathon presentations:

| Sandbox Limit | Restriction | Impact on LoanHer Prototype & Testing |
| :--- | :--- | :--- |
| **Join Required** | Outbound messaging is blocked until the recipient opts in by texting `join <code>`. | Unjoined recipients fail with error `63015`. All judges or team testers must join the sandbox first. |
| **24-Hour Window** | Freeform outbound messages are only permitted within 24 hours of the user's last message to the bot. | If 24 hours pass without an inbound message, outbound delivery fails (`63016`). User must send a text (e.g. "hi") to reopen the window. |
| **3-Day Expiry** | The sandbox join session expires automatically after 72 hours (3 days). | Team members will suddenly stop receiving messages every 3 days. Simply re-send `join <code>` in WhatsApp to renew. |
| **~50 Messages/Day on Trial** | Free trial accounts are limited to approximately 50 WhatsApp/SMS messages per 24 hours. | Avoid running automated loops or stress tests. Reserve daily volume for demo runs and live judging. |
| **No Custom Templates** | Shared Twilio sender identity (`+1 415 523 8886`, "Twilio Sandbox"). Pre-approved WhatsApp templates are unavailable. | Outbound messages show "Twilio Sandbox" branding rather than "LoanHer". Explain to judges that this is Twilio's standard hackathon testbed. |

---

## 5. Troubleshooting

### 1. Message Not Delivered
- **Symptom:** Script outputs error `63015` (`Channel Sandbox can only send to joined numbers`), message status stays `failed`/`undelivered`, or no message arrives on WhatsApp.
- **Cause 1:** The recipient has not joined the sandbox, or their 3-day join session expired.
  - **Fix:** Have the recipient send `join <your-sandbox-code>` to `+1 415 523 8886` from WhatsApp. Wait for Twilio's confirmation response.
- **Cause 2:** The 24-hour communication window expired (error `63016`).
  - **Fix:** Ask the recipient to send any message (e.g. *"hi"* or *"LoanHer"*) to `+1 415 523 8886` to reopen the 24-hour window.
- **Cause 3:** The daily trial quota (~50 messages) was exhausted (error `20429` / `20008`).
  - **Fix:** Check message logs in Twilio Console under **Monitor** &rarr; **Logs** &rarr; **Messaging**. Wait for the 24-hour quota reset or add credits to the Twilio account.

### 2. Auth Error
- **Symptom:** Twilio API returns `HTTP 401` with error `20003` (`Authenticate`), or script fails on startup with `Missing required environment variable(s)`.
- **Cause:** Missing, invalid, or placeholder credentials in `backend/.env`.
- **Fix:**
  1. Open `backend/.env`.
  2. Confirm `TWILIO_ACCOUNT_SID` and `TWILIO_AUTH_TOKEN` match your project in [Twilio Console](https://console.twilio.com).
  3. Ensure placeholder values (`your_twilio_account_sid`, `your_twilio_auth_token`) were replaced with real credentials.
  4. Ensure there are no surrounding quotes or trailing spaces.
  5. *Remember: Never commit or share your auth token.*

### 3. Wrong Number Format
- **Symptom:** Error `21211` (`Invalid 'To' Phone Number`) or script outputs `Invalid phone number format`.
- **Cause:** Invalid telephone number syntax, letters, missing digits, or malformed country codes.
- **Fix:**
  - Provide a standard Nigerian phone number. The script automatically handles:
    - Local format: `08031234567` (converted automatically to `whatsapp:+2348031234567`).
    - International format: `+2348031234567`.
    - Twilio format: `whatsapp:+2348031234567`.
  - Avoid special characters or letters.

---

## 6. Demo Day Checklist

Before demonstrating the WhatsApp flow to judges:
- [ ] **10 mins before:** Have the presenter/judge send `join <code>` to `+1 415 523 8886` to verify active sandbox status.
- [ ] **5 mins before:** Send a message to the bot from the phone to ensure the 24-hour window is fresh.
- [ ] **Check quota:** Confirm on [Twilio Console](https://console.twilio.com) that the account has sufficient trial messages remaining.
