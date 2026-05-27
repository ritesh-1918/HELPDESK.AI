## 🏆 Beginner Design Bounty Description

To wowed users at first glance, the landing page call-to-action (CTA) buttons (like "Get Started Free" and "Watch Demo") should feel extremely responsive and alive. 

Currently, our buttons use vanilla styles. We want to add subtle, premium hover animations and active micro-transitions to match our Harmonious dark mode glassmorphism aesthetic.

---

## 🛠️ Requirements

1. **Vibrant Hover Transitions**:
   * Add scale transforms (`hover:scale-105 active:scale-[0.98]`) to all primary and secondary landing page CTA buttons.
   * Integrate subtle glow shadows (`shadow-lg shadow-emerald-900/20 hover:shadow-emerald-900/35`) matching the theme color on hover.
2. **Interactive Flow Indicators**:
   * Add subtle micro-animations to icon arrows (like `ArrowRight` or `Play`) inside CTA buttons when hovered (e.g. slight `translateX` translations).
3. **Responsive Verification**: Ensure there are no layout shifts on mobile viewports.
4. **Target Branch**: Please target the `gssoc` branch, NOT `main`.
