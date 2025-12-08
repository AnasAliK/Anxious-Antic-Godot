# Anxious-Antic
Anxious Antic is a fast, chaotic 20-second sprint through socially awkward moments. With no tutorials and instant pressure, you must make quick choices to avoid embarrassment and survive the panic-filled comedy before time runs out.

---

# **Anxious Antic – Game Design Document**

---

## **1. High Concept**

A fast-paced, humorous micro-game where the player helps a socially anxious character navigate public situations. Each level lasts **20 seconds**, during which the player must identify and neutralize social threats (like someone taking a photo or approaching to talk) before the character panics. The game is quick, chaotic, and funny—every second counts.

---

## **2. Gameplay Overview**

### **2.1 Core Loop**

1. Player sees the anxious character in a public scenario.
2. A “social threat” (NPC action) appears.
3. Player must identify and interact with the threat before the 20-second timer ends.
4. **Success:** Character relieved → level complete.
5. **Failure:** Threat completes action → comedic panic reaction.

**Core Mechanic:** Quick point-and-click/tap interaction.

---

### **2.2 Controls**

* **Mouse:** Click on NPC/object to stop threat
* **Keyboard (optional):** Arrow keys move selection cursor
* **UI Buttons:** Optional “Retry” and “Next Level”

---

### **2.3 Win / Lose Conditions**

**Win:** Interact with the correct NPC/object before time ends.
**Lose:** Timer hits zero, or the threat completes its action.

**Feedback:**

* **Success:** Calm animation, relief
* **Failure:** Exaggerated panic (sweat, flinch, jump)

---

## **3. Levels & Situations**

Each level = 20-second public scenario with escalating variety.

| Level | Scenario                   | Task                               | Failure                      |
| ----- | -------------------------- | ---------------------------------- | ---------------------------- |
| 1     | Stranger taking a photo    | Click NPC to block them            | Photo taken                  |
| 2     | NPC approaches to talk     | Distract or click object           | Forced conversation          |
| 3     | Group laughing             | Identify correct target            | Wrong choice → embarrassment |
| 4     | Waiter calling loudly      | Hide / redirect attention          | Public callout               |
| 5     | Livestream camera pointing | Turn character away / block camera | Appears on livestream        |
| 6     | Bench being taken          | Block or save spot                 | Stranger sits next to them   |

**Optional Additions:**

* Fake threats
* Increased visual distractions

---

## **4. Art & Visual Style**

* **Characters:** Minimalist, expressive, cartoony
* **Backgrounds:** Parks, cafes, streets (simple + colorful)
* **Threat Highlights:** Glow/indicator before timer ends

**Effects:**

* Slight camera shake during high anxiety
* Flash indicators for threats
* Soft vignette when anxiety peaks

---

## **5. Sound & Music**

### **5.1 Sound Effects**

* Panic heartbeat, rapid breathing
* Camera shutter, phone ring
* Crowd murmurs, laughter
* Success: “phew”
* Failure: exaggerated gasp/squeak

### **5.2 Music**

* Light ambient tension
* Pulsing rhythm
* Comedic plucks for funny moments

---

## **6. UI / HUD**

* **Timer:** 20-second countdown (top-right)
* **Optional Anxiety Meter**
* **Minimal Tutorial:** “Click threats to stop them!”

**Menus:**

* Start
* How to Play
* Exit
* Game Over → Retry / Next Level / Menu

---

## **7. Technical Overview**


* **Key Nodes:**

  * `Timer` – Main countdown
  * `NPC` – Threats (Node2D + animation)
  * `Area2D` – Clickable hitboxes
  * `AnimationPlayer` / `Tween` – Reactions + camera shake

**HTML5 Optimization:**

* Canvas resize
* Gzip/Brotli
* Disable unused rendering effects

---

## **8. Game Loop / Flow**

1. Main Menu → Start
2. Level begins → Timer starts
3. Threat appears → Player reacts
4. Check Outcome

   * **Success:** Relief animation → Next level
   * **Failure:** Panic animation → Retry

**Progression:**
Levels can loop with randomized threats for replay value.

---

## **9. Publishing Plan**

1. Export HTML5 build
2. Test in Chrome/Firefox
3. Upload to itch.io

   * Set as HTML game
   * Embed playable window
   * Add screenshots + short description
4. Submit to **20-Second Game Jam**

---

## **10. Marketing / Jam Notes**

**Short Description:**
*“Help a socially anxious character survive 20-second panic scenarios! Stop strangers, cameras, and awkward moments before time runs out.”*

**Tips:**

* Use humorous screenshots
* Highlight panic expressions
* Title: **Anxious Antic** (funny + memorable)

---

## **11. Optional Enhancements (Post-Jam)**

* More levels
* Randomized threat patterns
* Unlockable skins
* Global leaderboard
* Dynamic sound/mood changes

---

