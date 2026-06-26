# DRAWN — Product Requirements Document
**Version 1.0 · Confidential**

---

## Overview

DRAWN is a luxury goods raffle platform where users buy low-cost tickets to win high-value designer items. All draws close at 9pm every night. Sellers are verified individuals listing real luxury goods. The platform combines e-commerce with live community events and gamification.

**Core value proposition:** Win designer things for pennies. Real luxury. Verified sellers. Every night at 9pm.

---

## 1. User Roles

### 1.1 Buyer
- Browses and enters draws
- Manages wallet and tickets
- Participates in live events and chat
- Earns streak rewards and grand draw entries

### 1.2 Seller
- Lists items for raffle
- Must complete identity verification before going live
- Manages active draws and receives payouts
- Has access to a seller dashboard

### 1.3 Guest (unauthenticated)
- Can browse draws and view listings
- Cannot purchase, chat, or save draws
- Prompted to sign up at point of action

---

## 2. Authentication

### 2.1 Landing / Splash Screen
- Full-screen branded screen with DRAWN logo and tagline
- Live countdown pill showing time until next 9pm draw
- Hero grid of luxury items (3 columns, static showcase images)
- Rotating recent winners carousel (auto-advances every 4 seconds)
- "How it works" section (3 steps: Browse → Buy tickets → Win at 9pm)
- Primary CTA: "Get started — it's free"
- Secondary link: "Already have an account? Log in"

### 2.2 Sign Up
- Fields: Full name, Email address, Password (minimum 8 characters)
- Checkbox: "I agree to DRAWN's Terms of Service and Privacy Policy" (required)
- Handle is auto-generated from name (not entered manually)
- Clear inline error messages for each field
- On success: redirected to Interests selection screen
- Error states: existing email, weak password, missing fields

### 2.3 Log In
- Fields: Email, Password
- "Forgot password?" link
- "Don't have an account? Sign up" link
- Error state for wrong credentials

### 2.4 Interests Selection (post sign-up)
- Shown immediately after sign up
- Multi-select chip grid of categories (Fashion, Watches, Luxury, Streetwear, Vintage, Bags, Trainers, Jewellery, Accessories, etc.)
- User selects what they are interested in — used to personalise their feed
- Can be skipped
- "Continue" button

### 2.5 Forgot Password
- Email input
- Sends a reset link to the user's email
- Confirmation message shown after submission

### 2.6 Reset Password
- Accessed via link in email
- New password + confirm password fields
- Inline validation

---

## 3. Navigation Structure

Five main tabs (always visible when logged in):

1. **Home** — browse draws
2. **Live** — real-time draw event and chat
3. **Tickets** — draws the user has entered
4. **Grand Draw** — monthly meta-game
5. **Account** — profile, wallet, settings

---

## 4. Home Tab

### 4.1 Navigation Bar
- DRAWN logo (tappable, scrolls to top)
- Streak badge (shows current streak count, pulses when 2 or more days)
- Search icon (opens search screen)
- Wallet balance pill (shows current balance, taps to wallet)

### 4.2 Live Activity Ticker
- Rotating banner showing real-time activity: "@user just bought X tickets on [draw]", "Draw threshold hit!", etc.
- Fades between messages every 8 seconds

### 4.3 You Won Banner (conditional)
- Shown at top when user has an unclaimed win
- Gold trophy icon, "You won" title, draw name
- Taps to winner detail screen
- Highest visual priority on screen

### 4.4 Hero Featured Draw
- Large image background with dark overlay
- "CLOSING TONIGHT · 9PM" badge with pulsing live dot
- Viewer count
- Item title, seller name
- Ticket price to retail value (e.g. "10p → £450")
- Progress bar showing percentage of tickets sold
- "Enter draw" button

### 4.5 Recent Winner Banner
- Rotating banner showing: handle, item won, what they paid, retail value
- Slides every 9 seconds

### 4.6 Tonight Info Strip
- "X draws tonight at 9pm · you're in Y" summary
- "Watch live →" link button

### 4.7 Browse by Category
- Horizontal scroll of category pills with emoji icons
- Tapping a category filters the main grid

### 4.8 Filter Chips
- Horizontal scroll: Tonight, Womenswear, Menswear, High Value, Bundles, Just Listed, Watches, Bags, Trainers
- Tapping a chip filters the draw grid below
- Active chip has highlighted state

### 4.9 Curated Style Rows
- Three horizontal scroll rows: Womenswear & Accessories, Menswear & Streetwear, Unisex & Everything Else
- Each row sorted by retail value (highest first), up to 8 draws per row
- Each row has a "See all" link

### 4.10 Picked for You Card (conditional)
- Shown when user is logged in, has entered draws, and there is a high-value draw they haven't entered
- Card with image, title, brief CTA

### 4.11 Main Draw Grid
- 2-column layout for regular draws
- Full-width for bundle draws
- When a bundle appears next in the sequence, the preceding draw also goes full-width
- Social proof footer at the bottom: "All draws verified · Every night at 9pm · Free postal entry available"

---

## 5. Draw Card Component

Used throughout the app in grids and rows.

**Contents:**
- Product image (fills card top)
- Verified badge (if seller is verified)
- "BUNDLE" tag (if applicable, gold accent)
- "CLOSING TONIGHT" badge (if status is closing tonight, pink with live dot)
- Scarcity warning: "Only X left" (shown when fewer than 500 tickets remain, red pulsing border)
- Draw title
- Ticket price → retail value (e.g. "10p → £2,400")
- Seller name with emoji avatar
- Progress bar (tickets sold as percentage, red when over 85%)
- Watch/save button (bookmark icon, top right corner)

---

## 6. Draw Detail Screen

Accessed by tapping any draw card.

### 6.1 Header
- Back button
- Share button
- Watch/save toggle button

### 6.2 Image Section
- Full-width hero image
- Condition badge (New, Like New, Good, Fair)
- Verified badge if applicable

### 6.3 Draw Info
- Title (large serif)
- Seller name + emoji avatar, tappable (links to seller profile)
- Ticket price pill, retail value pill
- Progress bar: X% of Y tickets sold
- Viewer count
- Postal entry count (if available)

### 6.4 Description
- Full item description
- Expandable if long

### 6.5 Social Proof
- Recent buyer activity (e.g. "@user just bought 5 tickets — 2 mins ago")
- Rotates through recent actions

### 6.6 Entry Section
- "Enter draw" primary button (sticky at bottom)
- If closing tonight: urgency messaging

---

## 7. Purchase Flow

### 7.1 Purchase Screen
Accessed via "Enter draw" button.

- Draw title and image (compact summary at top)
- Ticket price displayed
- Quick quantity selector: 1, 5, 10, 25 (tappable pills)
- Manual quantity input field
- Running total: "X tickets · £Y.pp"
- Max purchase limit warning (if user tries to buy more than allowed)
- Wallet balance shown: "Balance: £X.XX"
- Warning if balance insufficient with top-up shortcut
- "Confirm purchase" button
- Live ticker showing other buyers ("@user just bought X tickets")

### 7.2 Purchase Loading State
- Spinner or animated loading state
- "Securing your tickets…"

### 7.3 Purchase Success Screen
- Confetti animation
- Large emoji or checkmark
- "You're in!" heading
- Draw name, tickets bought, total paid
- "Your odds: 1 in X" (calculated live)
- Countdown to 9pm draw
- "Watch live at 9pm →" button
- "Browse more draws" secondary link

---

## 8. Live Tab

### 8.1 Header
- Pulsing live dot + "LIVE" or "TONIGHT AT 9PM" label
- "The 9pm Draw" heading
- Auto-rotating hype message (e.g. "Draw confirmed · 9pm tonight")

### 8.2 Prize Wheel
- Animated spinning wheel showing up to 8 user handles
- Spins continuously before/during 9pm
- Shows winner with animation once draw resolves
- "Draw starts in" overlay before 9pm

### 8.3 Countdown Card (before 9pm)
- "Draw starts in" label
- Hours : Minutes : Seconds in large serif font
- Urgency note: "Don't miss the reveal"

### 8.4 Watch Live Button (at/after 9pm)
- "Watch Live Now" primary button (replaces countdown)

### 8.5 Live Chat
- Real-time message feed
- Colored user handles (color assigned per handle, consistent per session)
- Scrolls to latest message automatically
- Requires login to participate; shows "Log in to join the chat" otherwise
- Text input + send button
- Quick emoji reaction buttons: 🔥 ❤️ 😍 🏆 💜 🎉
- Emoji reactions float upward from button and fade out

### 8.6 Viewer Count
- "👁 X watching" badge in header or chat header

### 8.7 Tonight's Draws List
- All draws closing tonight, numbered
- Each row: thumbnail, title, seller, ticket price → retail value
- "You: X tickets" badge if user holds tickets
- Scarcity badge if fewer than 200 tickets remain
- Tappable to go to draw detail

---

## 9. Tickets Tab

### 9.1 Header Summary Strip
- Total tickets held | Total retail value | Number of draws entered
- e.g. "24 tickets · £2,400 in 3 draws"

### 9.2 Callout Card
- Lightning bolt icon
- "Win up to £X for as little as Yp" (calculated from held tickets)
- If no tickets: "Enter a draw to see your potential winnings"

### 9.3 Ticket Cards (one per entered draw)

**Top section:**
- Draw thumbnail (52×52)
- Tonight indicator dot (if draw closes tonight)
- Draw title + verified checkmark
- Seller name
- Ticket price → retail value
- Progress bar (red if over 85% sold)
- Scarcity badge ("Only X left" if under 500)

**Status tag:**
- "Draws tonight at 9pm" (pink) or "Draws tomorrow at 9pm" (purple)

**Bottom stats:**
- Your ticket count
- Price per ticket
- Your odds % (gold if ≥1%, lilac if ≥0.5%, grey otherwise)
- "More" button (reopens purchase flow for this draw)

### 9.4 Empty State
- 🎫 icon
- "No tickets yet"
- "Enter your first draw for as little as 10p. Tonight's closes at 9pm."
- "Browse tonight's draws →" button

### 9.5 Real-time
- Ticket counts update live as other users buy
- Odds percentage recalculates in real time

---

## 10. Grand Draw Tab

Monthly meta-game. Every day you log in, you earn one ticket into the month's Grand Draw. The draw resolves on the last day of the month at 9pm.

### 10.1 Navigation
- DRAWN logo + current month label

### 10.2 Shield Notification (conditional)
- Dismissible card shown when shield was used that day
- Explains that the streak was protected

### 10.3 Prize Card
- "GRAND DRAW" badge with live dot
- Large emoji (42px)
- Prize title in large serif font
- Short description
- "Worth £X | Fund: £Y" badge
- Purple gradient background

### 10.4 Countdown Card
- "Draw resolves in"
- Days · Hours · Minutes in large serif
- "Last day of [Month] · 9pm"

### 10.5 Your Entries Card
- "Your entries this month" (large number)
- "Your odds: 1 in X"
- Progress bar (visual, capped for display)
- "X total entries in pool"

### 10.6 Daily Ticket Claim
- Green "Claim today's ticket" button (available once per day)
- Changes to disabled state after claim with "+1 ticket claimed" confirmation
- Resets at midnight

### 10.7 Streak Card
- 🔥 icon + current streak number (large)
- "Longest streak: X days"
- "All-time earned: X tickets"
- Achievement badge if milestone reached:
  - ⭐ "7-day streak" at 7 days
  - 🏅 "Monthly Faithful" at 30 days

### 10.8 Login Calendar
- Monthly grid (7 columns, all days of the month)
- Gold cell = logged in that day
- Gold + shield icon = missed but shield used
- Dark/red cell = missed day
- Pink border = today
- Legend below grid

### 10.9 Past Draws
- Most recent completed month
- Prize emoji, month name, prize title, retail value
- "WINNER" label
- Winner handle
- Stats: "X tickets held · Y% of pool"

---

## 11. Account Tab

### 11.1 Profile Header
- Large circular avatar (emoji, editable by tapping)
- Handle (@username)
- Badge row:
  - ✦ Founding Member (early user badge)
  - ✓ Verified Seller (if applicable)
  - 🔥 X day streak (if active)

### 11.2 Wallet Balance
- Current balance displayed as pill
- Tappable, opens wallet

### 11.3 Stats Section

**Buyer stats (4 columns):**
- Active draws entered
- Total tickets purchased
- Draws won
- Total value won (£)

**Seller stats (split card, if seller):**
- AS BUYER: Draws entered | Won
- AS SELLER: Earned | Pending payout

### 11.4 Conditional Nudges

**Complete Profile Nudge** (if interests not set):
- "Personalise your feed"
- "Tell us what you're into for better draws"
- Taps to interests screen

**Seller Quick Actions** (if verified seller):
- "+ List new item" primary button
- "Dashboard" secondary button

**KYC Nudge** (if seller application submitted but not verified):
- "Complete your verification"
- "Required before your draws can go live"

### 11.5 Achievement Badges (6-grid)
Each badge shows icon, label, and state:
- **Founding Member** — star icon — for early users
- **First Entry** — ticket icon — entering first draw
- **3-Day Streak** — flame icon — 3 consecutive logins
- **First Win** — trophy icon — winning a draw
- **25 Tickets** — layers icon — 25 total tickets purchased
- **First Sale** — storefront icon — sellers only

Locked badges show progress bar (e.g. "2 of 25 tickets"). Unlocked badges show a checkmark.

### 11.6 Recent Wins (up to 3)
- Win cards: image, item name, date, retail value (gold badge)
- Empty state if no wins
- "View all →" link to notifications

### 11.7 Referral Card
- "Invite friends, earn credit"
- "£1 credit for every friend who joins"
- Referral code display + copy button (shows "Copied!" flash)
- Native share button

### 11.8 Menu Items
- My wallet
- My orders
- Saved draws
- Notifications
- Settings
- (If seller: Dashboard, Payouts)
- (If not seller: Become a seller)
- Privacy policy
- Terms of service
- Log out (red, bottom)

### 11.9 Version Footer
- "Drawn · v[X] · London, UK"

### 11.10 Avatar Editor (modal)
- Grid of 30 emoji options
- Currently selected highlighted
- "Save" button

---

## 12. Wallet Screen

### 12.1 Header
- Close/back button
- "My Wallet" title

### 12.2 Balance Display
- "Available balance" label
- Large formatted balance (e.g. "£12.40" or "40p")

### 12.3 Added Confirmation (conditional)
- Checkmark icon
- "£X added to your wallet" confirmation flash
- Disappears after 2 seconds

### 12.4 Top-Up Options (2×2 grid)
- £5 / £10 / £20 / £50
- Tapping triggers payment and updates balance
- Shows "Added" animation after tap
- Requires connected payment method

### 12.5 Transaction History
- Chronological list of all wallet activity
- Each entry: icon, description, amount (green = credit, red = debit), date
- Transaction types: Top-up, Ticket purchase, Win credit, Payout, Referral credit
- Grouped by date (Today, Yesterday, [Date])

---

## 13. Search Screen

### 13.1 Search Bar
- Auto-focused on open
- Placeholder: "Search draws, brands, sellers…"
- Clear button (appears when text entered)

### 13.2 Filter Chips
- All, Tonight, Bundles, High Value, Just Listed
- Active state highlighted

### 13.3 Empty State (no search term entered)

**Browse Categories:**
- Fashion, Sneakers, Watches, Bags, Jewellery, Tech, Art
- Emoji + label for each, tappable

**Trending Searches:**
- Chanel, Rolex, Jordan 1, Supreme, Bottega, MacBook
- Tappable pill chips

**Recent Searches:**
- Up to 5 previous searches
- Auto-populated from history
- Shown above trending

### 13.4 Results Grid
- 2-column draw card grid
- Filtered by search term and active chip
- Searches across: title, seller name, description

---

## 14. Saved Draws Screen

- Header: "Saved Draws" + saved count
- 2-column DrawCard grid (same as home)
- Remove from saved on tap/swipe
- Empty state: "No saved draws yet. Tap the bookmark on any draw to save it."

---

## 15. Notifications Screen

### 15.1 Notification Types

| Type | Icon | Background | Description |
|------|------|-----------|-------------|
| Win | Trophy | Gold tint | "You won — [Item]" · "Worth £X — congratulations!" |
| Payout | Cash | Pink tint | "Payout received" + amount |
| Purchase | Ticket | Lilac | "X tickets purchased" + draw name |
| Reminder | Bell | Lilac | Draw closing reminder |
| Approved | Checkmark | Pink | Seller listing approved |

### 15.2 Display
- Grouped by date
- Relative timestamps (2 mins ago, Yesterday, etc.)
- Tappable — opens relevant screen (e.g. win → winner screen)
- Mark as read state

---

## 16. Seller System

### 16.1 Become a Seller (Application)

**Screen: Apply**
- Intro copy: what it means to be a DRAWN seller
- Fields: Full name, Instagram handle (optional), First item description
- Submit button
- On success: confirmation + "KYC next" explanation

**Screen: KYC / Identity Verification**
- Intro explaining why verification is needed
- Fields: Full legal name, Date of birth (DD/MM/YYYY)
- ID photo upload (passport or driving licence)
- "Submit" button
- Success state with "We'll review within 24 hours" message

### 16.2 List a New Item (multi-step)

**Step 1: Type**
- Select draw type: Single item, Bundle, Vintage, Luxury, Streetwear, Tech
- Visual cards with icons

**Step 2: Photos**
- Upload up to 6 photos
- Drag to reorder
- First photo becomes hero image

**Step 3: Details**
- Title
- Description
- Condition: New / Like New / Good / Fair (pill select)
- Category (Bags, Trainers, Watches, Jewellery, Streetwear, etc.)
- Style: Womenswear / Menswear / Unisex

**Step 4: Pricing**
- Retail value (£)
- Ticket price (options: 10p, 25p, 50p, £1, or custom)
- Total tickets available
- Draw duration (days until close date, minimum threshold)
- Preview: "At full sell-out you earn £X"

**Step 5: Review**
- Summary of all entered details
- "Submit listing" button
- Liquidated damages clause (must accept checkbox before submitting)

**Progress bar across all steps:** Apply → Verify ID → List item

### 16.3 Seller Dashboard

**Header:**
- Back button
- "My Dashboard" + seller handle
- Verification status banner (if not yet verified)

**Earnings Cards:**
- Total earned (all time, £)
- Pending payout (ready to withdraw, £)

**Action Row:**
- "+ List a new item" (primary)
- "Payouts" (secondary, cash icon)

**Draw List:**
Each draw shows:
- Icon/thumbnail
- Title + status badge (Awaiting verification / Open / Closing tonight / Completed / Cancelled)
- Earnings for this draw
- Progress bar (% tickets sold)
- Ticket count and percentage
- Edit button (if pending/open)

### 16.4 Draw Complete Screen
- Final results summary
- Winner info (handle)
- Final earnings breakdown
- "Share winner card" option
- "List another item" CTA

### 16.5 Payout Screen
- Pending balance display
- Bank account details input / already linked display
- "Withdraw" button
- Withdrawal history list

---

## 17. Settings Screen

- Handle — edit with validation (3+ chars, alphanumeric/underscore)
- Email — edit
- Password — change (current password not required if via email link)
- Notification preferences:
  - Draw close reminders (toggle)
  - Win alerts (toggle)
  - New listings matching interests (toggle)
  - Grand draw reminders (toggle)
- Delete account (destructive action, confirmation required)

---

## 18. Orders Screen

- List of all purchase history
- Each entry: draw name, date, tickets bought, total paid, status (Entered / Won / Completed)
- Tappable to view draw detail
- Filter: All / Active / Won

---

## 19. Categories Screen

### 19.1 Available Now
- 2-column grid of category cards
- Each card: emoji (large), category name, short description, colour accent border
- Tapping filters home grid to that category

### 19.2 Coming Soon
- Greyed-out cards with "Coming soon" badge
- Communicates platform expansion beyond fashion

### 19.3 Suggest Card
- 💡 icon
- "Don't see what you want? We add new categories based on demand."

---

## 20. Legal Screens

- Terms of Service
- Privacy Policy
- Seller Terms

All scrollable, with section headings and body text. Accessible from account menu and sign-up.

---

## 21. Gamification & Retention Mechanics

### 21.1 Login Streaks
- One streak tick per calendar day the user opens the app
- Streak resets if a day is missed (unless shield is used)
- Streak count shown on account tab and home tab badge
- Badge pulses when streak ≥ 2 days

### 21.2 Streak Shield
- Limited number of shields available
- Auto-applies when a day is missed (if shield available)
- Preserves streak count
- Shown in calendar with shield icon on that day

### 21.3 Grand Draw Entries
- +1 ticket per day login to the current month's grand draw
- Monthly prize pool grows throughout the month
- Winner drawn at 9pm on last day of month

### 21.4 Achievement Badges
- 6 visible badges on profile
- Progress bars for locked achievements
- Checkmark + full colour when unlocked

### 21.5 Referral Programme
- Unique referral code per user
- £1 wallet credit when a referred friend signs up and enters their first draw
- Shareable via native share or copy link

---

## 22. Real-time Features

- **Ticket counts** update live on draw cards and detail screens as other users buy
- **Viewer count** shows how many users are on a draw right now
- **Live chat** in the Live tab: real-time messages and emoji reactions
- **Presence count** in Live tab: number of users watching
- **Purchase activity feed** rotating on home screen and draw detail
- **Winner reveal**: prize wheel animation at 9pm with live audience

---

## 23. Design Language

### 23.1 Aesthetic Direction
- Dark luxury — predominantly very dark backgrounds
- Purple and lilac primary palette (trustworthy, premium)
- Pink accents for urgency and live states
- Gold for winners, achievements, and premium states
- Clean typography with a serif display font for headlines and numbers

### 23.2 Colour Palette

| Name | Usage |
|------|-------|
| Dark Background | All screen backgrounds (near-black purple-tinted) |
| Dark Card | Card and surface backgrounds (slightly lighter) |
| Dark Border | Subtle borders and dividers |
| Lilac / Purple | Primary buttons, active states, highlights |
| Pink / Magenta | Urgency, live indicator, tonight labels |
| Gold / Amber | Winners, premium, achievements, highest value |
| White | Primary text |
| Mid Grey | Secondary text |
| Muted Grey | Tertiary text and placeholder |
| Green | Success states, wallet credits |
| Red | Danger, errors, scarcity warnings |

### 23.3 Typography

- **Display / Headings:** Serif italic (e.g. "Win £2,400", prize names, countdowns, large numbers)
- **Body / UI:** Clean sans-serif system font
- **Font size scale (approximate):** 10 → 12 → 14 → 16 → 20 → 28 → 34 → 42

### 23.4 Spacing
- Consistent 4-point grid
- Common values: 4, 8, 12, 16, 20, 28, 40

### 23.5 Radius
- Cards: 12–16
- Buttons: pill (fully rounded)
- Modals: 22–28 top corners

### 23.6 Buttons

| Type | Style |
|------|-------|
| Primary | Lilac to pink gradient background, white text, fully rounded pill, full width |
| Secondary / Ghost | Transparent with coloured text or border |
| Destructive | Red text or background |
| Disabled | Muted, reduced opacity |

### 23.7 Progress Bars
- Track: dark background
- Fill: lilac normally, red when ≥ 85% sold (scarcity warning)
- Animated fill on load

### 23.8 Cards
- Dark card background
- Subtle border
- Rounded corners
- Slight inner padding

### 23.9 Input Fields
- Dark background
- Light text
- Subtle border (brighter on focus)
- Floating or inline label above field

---

## 24. Animations & Micro-interactions

| Interaction | Animation |
|------------|-----------|
| Streak badge | Pulses scale 1 → 1.2 → 1 on loop |
| Live dot | Pulses opacity on loop |
| Draw cards loading | Fade in from below |
| Activity ticker | Cross-fade between messages |
| Scarcity cards | Red border pulses |
| Save/watch | Heart scales 1 → 1.5 → 1 |
| Emoji reactions | Float upward and fade out |
| Prize wheel | Spins 1080° over 5 seconds |
| Purchase success | Confetti burst |
| Wallet top-up | "Added" flash fades after 2 seconds |
| Countdown timer | Ticks every second (draws every 60 seconds when hours remain) |

---

## 25. Edge Cases & States

### Empty States (all screens need these)
- Home (no draws): "Draws open at 9pm — check back tonight"
- Tickets (none): Prompt to enter first draw
- Saved (none): Prompt to save a draw
- Orders (none): Prompt to buy tickets
- Notifications (none): "Nothing yet — we'll let you know when something happens"
- Search (no results): "No draws matched '[query]'" + category browse fallback

### Loading States
- Skeleton placeholder cards while draws load
- Spinner for async actions (purchase, top-up)
- Disabled button state while request in flight

### Error States
- Inline field errors on forms
- Full-screen error with retry when data fails to load
- Toast/banner for transient errors (e.g. purchase failed)

### Auth-gated Actions
- Watching/saving a draw: redirects to sign up if not logged in
- Entering a draw: redirects to sign up if not logged in
- Live chat: shows "Log in to join the chat" prompt inline
- Wallet top-up: sign up gate

---

## 26. Compliance & Trust Features

### 26.1 Free Postal Entry
- Every draw must offer a free alternative entry method by post
- Postal entry count shown on draw detail
- How-to-enter-by-post instructions accessible from draw detail

### 26.2 Seller Verification
- All sellers complete identity verification before listings go live
- Verified sellers show a checkmark badge on all listings
- Seller profile shows verified status

### 26.3 Draw Authenticity
- Items are reviewed before going live
- "Verified" badge on draw cards
- Condition descriptions must be accurate (seller agrees to terms)

### 26.4 Winner Verification
- Winner selected randomly and transparently
- Winner announced publicly on live screen
- Seller required to ship within defined timeframe

### 26.5 KYC for Sellers
- Identity document upload required
- Manual review process
- Listings held until verified

---

## 27. Notifications (Push)

| Trigger | Message |
|---------|---------|
| Draw closing in 1 hour | "⏰ [Draw] closes in 1 hour — you're in!" |
| Draw closing in 15 mins | "⚡ Final tickets — [Draw] closes at 9pm" |
| You won | "🏆 You won [Draw] — worth £X!" |
| Listing approved | "✓ Your listing '[Item]' is now live" |
| Payout sent | "💸 Payout of £X is on its way" |
| Grand draw won | "🎉 YOU WON THE GRAND DRAW — £X prize!" |
| Daily reminder (optional) | "🔥 Keep your streak — today's draw is live" |

User can toggle each category in Settings → Notifications.

---

## 28. Key Numbers & Rules

| Rule | Value |
|------|-------|
| Daily draw time | 9:00pm every night |
| Minimum ticket price | 10p |
| Maximum ticket price | No hard limit |
| Maximum tickets per user per draw | Percentage of total pool (prevents monopoly) |
| Grand draw reset | First day of each month |
| Grand draw resolve | Last day of each month at 9pm |
| Referral credit | £1 per referred friend |
| Seller revenue share | ~77% of total ticket revenue |
| Seller verification time | ~24 hours |
| Minimum streak for pulse animation | 2 days |
| Maximum photos per listing | 6 |
| Maximum recent searches shown | 5 |
| Scarcity badge threshold | Fewer than 500 tickets remaining |
| High scarcity threshold (Live tab) | Fewer than 200 tickets remaining |
| Odds colour: gold | ≥1% chance of winning |
| Odds colour: lilac | ≥0.5% chance of winning |

---

*End of document. This document describes only what the product does and how it should look and behave. No implementation or technology decisions are specified.*
