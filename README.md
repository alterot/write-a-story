# Saga-Boken

En interaktiv webbapp där barn (5-8 år) kan skapa egna sagor med hjälp av AI-agenter som samarbetar synligt i realtid.

## Översikt

Saga-Boken är ett lärprojekt som utforskar multi-agent AI-orkestration. Fyra specialiserade AI-agenter samarbetar för att skapa barnvänliga sagor, och hela processen visualiseras så att användaren ser hur agenterna itererar och förbättrar innehållet tillsammans.

## Agenterna

**Stella (Dirigent)** - Planerar berättelsen och koordinerar de andra agenterna

**Luna (Berättare)** - Skriver saga-kapitel med barnvänligt språk

**Nova (Granskare)** - Läser Lunas texter och ger feedback för förbättringar

**Pixel (Illustratör)** - Väntar för tillfället på integration med bildgenererande API

## Teknisk Stack

- React + Vite
- Anthropic Claude API (Sonnet 4.5)
- Event-driven arkitektur för agent-koordination
- CSS-animationer för agentrörelse

## Viktiga Designbeslut

**Riktig iteration**: När Nova (granskaren) avvisar Lunas (författarens) text så gör Luna faktiskt ett nytt API-anrop med feedback inbakad. Detta är äkta AI-samarbete, inte simulerad animation.

**Event-baserat system**: Orkestratorn skickar events till UI:t som visar dem direkt. All timing styrs av orkestratorn med strategiska pauser mellan API-anrop. Detta eliminerar race conditions och timing-problem.

**Korta sagor**: Nuvarande konfiguration är 2 kapitel om 2-4 meningar vardera. Detta begränsar token-kostnad (~0.10$ per saga) och underlättar utveckling. Prompts kan enkelt modifieras för längre berättelser.

## Säkerhetsvarning

Framtida förbättring: När DALL-E-integration läggs till kommer hela API-lagret flyttas till en backend-tjänst som säkrar alla nycklar ordentligt.

## Installation

```bash
git clone https://github.com/YOUR-USERNAME/saga-boken.git
cd saga-boken
npm install
npm run dev
```

## Innehållssäkerhet

Stella (orkestratorn) inkluderar automatisk innehållsvalidering som transformerar olämpliga förfrågningar till barnvänliga alternativ.

## Teknik

React 18, Vite, Claude API (Sonnet 4.5), CSS3

## Framtida Förbättringar

- Backend-tjänst för säkra API-anrop
- DALL-E-integration för riktiga bilder
- Längre och mer komplexa berättelser
- Export till PDF/HTML