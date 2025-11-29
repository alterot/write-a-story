# Write a Story

En interaktiv webbapp där barn (5-8 år) kan skapa egna sagor med hjälp av AI-agenter som samarbetar synligt i realtid.

## Översikt

Write a Story är ett lärprojekt som utforskar multi-agent AI-orkestration. Fyra specialiserade AI-agenter samarbetar för att skapa barnvänliga sagor, och hela processen visualiseras så att användaren ser hur agenterna itererar och förbättrar innehållet tillsammans.

## Agenterna

**Stella (Dirigent)** - Planerar berättelsen och koordinerar de andra agenterna

**Luna (Berättare)** - Skriver saga-kapitel med barnvänligt språk

**Nova (Granskare)** - Läser Lunas texter och ger feedback för förbättringar

**Pixel (Illustratör)** - Väntar för tillfället på integration med bildgenererande API

## Teknisk Stack

- Frontend: React + Vite (GitHub Pages)
- Backend: Cloudflare Worker (serverless API proxy)
- AI: Anthropic Claude API (Sonnet 4.5)
- Event-driven arkitektur för agent-koordination
- CSS-animationer för agentrörelse

## Arkitektur

Applikationen använder en säker serverless-arkitektur där frontend och backend är separerade:

**Frontend** (GitHub Pages) hanterar UI och agent-visualisering  
**Cloudflare Worker** agerar som säker proxy mellan frontend och Claude API  
**API-nycklar** lagras krypterade i Cloudflare secrets, aldrig exponerade i frontend-kod

## Viktiga Designbeslut

**Riktig iteration**: När Nova (granskaren) avvisar Lunas (författarens) text så gör Luna faktiskt ett nytt API-anrop med feedback inbakad. Detta är äkta AI-samarbete, inte simulerad animation.

**Event-baserat system**: Orkestratorn skickar events till UI:t som visar dem direkt. All timing styrs av orkestratorn med strategiska pauser mellan API-anrop. Detta eliminerar race conditions och timing-problem.

**Korta sagor**: Nuvarande konfiguration är 2 kapitel om 2-4 meningar vardera. Detta begränsar token-kostnad (~0.10$ per saga) och underlättar utveckling. Prompts kan enkelt modifieras för längre berättelser.

### Lokal utveckling
```bash
git clone https://github.com/alterot/write-a-story.git
cd write-a-story
npm install
npm run dev
```

Appen använder Cloudflare Worker för API-anrop, så ingen lokal API-nyckel behövs.

### Produktion (med Cloudflare Worker)

Backend-koden finns i separat repo: [write-a-story-worker](https://github.com/alterot/write-a-story-worker) (Inte pushad än, just nu bara lokal versionshantering) 

Worker hanterar säker kommunikation med Claude API och kräver Cloudflare account.

## Innehållssäkerhet

Stella (orkestratorn) inkluderar automatisk innehållsvalidering som transformerar olämpliga förfrågningar till barnvänliga alternativ.

## Teknik

React 18, Vite, Cloudflare Workers, Claude API (Sonnet 4.5), CSS3

## Framtida Förbättringar

- DALL-E-integration för riktiga bilder
- Längre och mer komplexa berättelser
- Export till PDF/HTML
