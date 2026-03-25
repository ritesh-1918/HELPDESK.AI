# HELPDESK.AI Test User Inputs (20-30 Cases)

A comprehensive dataset for stress-testing the AI's classification, NER, and summarization engines.

## 1. Professional & Technical Inputs
1. **Case 1 (Standard):** "I am experiencing intermittent connectivity drops on the SQL production cluster. The latency spikes every 15 minutes, affecting the application's response time. Please investigate the network routing."
2. **Case 2 (Detailed):** "Requesting a priority account unlock for user id 'admin_ritesh'. The MFA token is not synchronizing with the server `auth-srv-02`. This is blocking the quarterly financial deployment."
3. **Case 3 (Software):** "The CRM application is throwing a 'NullPointerException' at the login module after the v2.4.1 update. Log files attached. Need a rollback or urgent patch."
4. **Case 4 (Access):** "New employee onboarding: Please grant Read/Write access to the `git-repo-main` for user `ritesh@helpdesk.ai`. Department: DevOps."
5. **Case 5 (Network):** "Firewall block detected on port 443 for the IP range `172.16.254.120/24`. We are unable to reach the external payment gateway."

## 2. Tough & Difficult Inputs (Edge Cases)
6. **Case 6 (Ambiguous):** "It's not working again. I tried the thing from last time but the screen just stayed blank. I have a meeting in 5 minutes. FIX THIS NOW!" (Testing 'General/Low Confidence' handling)
7. **Case 7 (Multi-Issue):** "My mouse is broken, the internet is slow, and I can't find the link to the HR portal. Also, someone spilled coffee on the printer." (Testing multi-entity extraction)
8. **Case 8 (Very Long/Vague):** "I was sitting at my desk, and I noticed that the fan on my laptop was making a noise, then I opened Chrome, then it crashed, but then I realized I hadn't updated my password in 3 months. Now I'm locked out but I think the fan is still the main problem." (Testing summarization and priority logic)
9. **Case 9 (Technical Jargon):** "The BGP flapping on the edge router `rtr-hq-01` is causing packet loss across the MPLS cloud. We need an immediate trace from `10.0.0.1`."
10. **Case 10 (Systemic):** "The entire floor 4 is without WiFi. The APs are showing red lights. Potential power surge or switch failure."

## 3. Human Fillers & Rough Language
11. **Case 11:** "Um, hi... so, like, I was trying to, you know, open the website but it's like... giving me this weird error? I think it says Error 404 or something? Can you um... help?"
12. **Case 12:** "Honestly, this system is so frustrating. I've been trying to login for like an hour. The IP thingy says it's invalid. Whatever that means. Just make it work."
13. **Case 13:** "Wait, nevermind... oh actually, wait. It's still broken. I thought it fixed itself but it didn't. Hostname error `srv-prod-01`. Ugh."
14. **Case 14:** "Yo, support! My computer is acting crazy. Screens are flickering and I hear a beeping sound. Is it gonna explode? lol. Help me out."
15. **Case 15:** "Err, sorry to bother you but I think I deleted the wrong folder on the shared drive. It was called `Project_Alpha`. Can we get a backup from last night?"

## 4. Multi-Lingual Inputs (Testing Translation & NER)
16. **Case 16 (Hindi/English Mix):** "Mujhe login karne mein problem ho rahi hai. Screen par 'Invalid Credentials' aa raha hai. Please check karke reset kar do."
17. **Case 17 (Hindi):** "Mera internet kaam nahi kar raha hai. Maine router restart kiya par phir bhi connectivity nahi hai."
18. **Case 18 (Spanish):** "No puedo acceder a mi correo electrónico. Me dice que la contraseña es incorrecta pero estoy seguro de que es la correcta."
19. **Case 19 (French):** "L'imprimante au troisième étage ne fonctionne plus. Elle affiche un bourrage papier mais il n'y a rien."
20. **Case 20 (German):** "Mein Bildschirm ist plötzlich schwarz geworden und der Computer lässt sich nicht mehr einschalten."

## 5. Mixed Format & Hardware Focus
21. **Case 21:** "Blue screen of death on my laptop `LP-X230`. Error code: `WHEA_UNCORRECTABLE_ERROR`. Happened right after I plugged in the second monitor."
22. **Case 22:** "The keyboard on my MacBook is double-typing the letter 'E'. It's making it impossible to write emails. I need a replacement or repair."
23. **Case 23:** "Our Zoom room camera is showing a black screen. The USB cable seems loose but I'm not sure. We have a board meeting in 20 mins."
24. **Case 24:** "Battery is draining too fast. 100% to 10% in 45 minutes without even running heavy apps. Laptop is only 6 months old."
25. **Case 25:** "I lost my laptop charger at the airport. Can I get a spare from the IT closet? I'm working from home tomorrow."

## 6. Security & Urgent Requests
26. **Case 26:** "I just received a very suspicious email asking for my corporate credentials. I think I clicked a link. What should I do??"
27. **Case 27:** "Urgente: Perdí mi teléfono corporativo en un taxi. Por favor, bloqueen el acceso a todas las aplicaciones de la empresa de inmediato." (Urgent Spanish)
28. **Case 28:** "My account was accessed from an unrecognized IP in another country. I just got a security alert. Help!"
29. **Case 29:** "Someone is trying to change my MFA settings without my permission. I'm getting codes on my phone that I didn't request."
30. **Case 30:** "We have a critical server outage in the Tokyo datacenter. All services are down. `ping 1.1.1.1` also failing."
