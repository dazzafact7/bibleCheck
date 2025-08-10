# 📖 Bible Fact Checker

> **Objektive KI-gestützte Analyse biblischer Thesen durch Dialektik und Wahrheitsfindung**

[![Demo](https://img.shields.io/badge/Live%20Demo-biblecheck.io-blue?style=for-the-badge)](https://biblecheck.io)
[![Next.js](https://img.shields.io/badge/Next.js-14-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![License](https://img.shields.io/badge/License-Open%20Source-green?style=for-the-badge)](LICENSE)

## 🎯 Was ist Bible Fact Checker?

Bible Fact Checker ist eine **neutrale, Open-Source-Webanwendung**, die zwei biblische Thesen mittels fortschrittlicher KI-Methoden objektiv analysiert und bewertet. Die App verwendet **Natural Language Inference (NLI)**, **Dialektik** und **strukturierte Argumentation**, um eine transparente und nachvollziehbare Bewertung zu liefern.

### 🔍 Kernfunktionen

**📊 Intelligente Analyse-Pipeline:**
- **Claim-Extraktion**: Zerlegung komplexer Thesen in überprüfbare Einzelaussagen
- **NLI-Bewertung**: Logische Beziehungsanalyse zwischen allen Claim-Paaren  
- **Theologische Debatte**: KI-generierte Pro/Contra-Argumente bei Widersprüchen
- **Finale Bewertung**: Gewichtete Scores für Stringenz, Kohärenz und biblische Fundierung

**🎨 Moderne Benutzeroberfläche:**
- Responsive Design mit **Framer Motion**-Animationen
- Intuitive Eingabefelder mit Beispiel-Thesen
- **Interaktive Visualisierung** der Analyse-Ergebnisse
- Detaillierte **Tree View** aller Argumentationsketten

**⚡ Technische Excellence:**
- **Next.js 14** mit React 18
- **OpenRouter API** Integration (Moonshot AI)
- **Intelligentes Caching** zur Performance-Optimierung
- **JSON5-Parser** für robuste Datenverarbeitung

## 🚀 Live Demo

**Teste die App:** [biblecheck.io](https://biblecheck.io)

Probiere beispielsweise diese Thesen aus:
- *"Glaube allein führt zur Erlösung"*
- *"Gute Werke sind notwendig für das ewige Leben"*

## 🛠️ Installation & Setup

### Voraussetzungen
- Node.js 18+
- OpenRouter API Key

### Quick Start

```bash
# Repository klonen
git clone https://github.com/dazzafact7/bibleCheck.git
cd bibleCheck

# Dependencies installieren
npm install

# Environment-Variablen konfigurieren
cp .env.example .env
# Füge deinen OPENROUTER_API_KEY hinzu

# Development Server starten
npm run dev
```

Die App ist dann verfügbar unter `http://localhost:3000`

### Environment Setup

```env
OPENROUTER_API_KEY=dein_api_key_hier
```

## 🏗️ Architektur & Funktionsweise

### 1. **Claim-Extraktion** (`lib/factChecker.js`)
```javascript
// Zerlegung komplexer Thesen in überprüfbare Claims
const claims = await extractClaims(thesis);
```

### 2. **NLI-Analyse** (Natural Language Inference)
```javascript
// Bewertung logischer Beziehungen zwischen Claims
const nliResult = await nliJudge(premisse, hypothese);
// Kategorien: entail | contradict | neutral
// Scores: 0.00 (starker Widerspruch) bis 1.00 (starke Unterstützung)
```

### 3. **Theologische Debatte**
```javascript
// Generierung von Pro/Contra-Argumenten bei Widersprüchen
const debateArgs = await debate(claimA, claimB);
```

### 4. **Finale Bewertung**
```javascript
// Gewichtete Scores für finale Entscheidung
const verdict = await finalJudge({
  scoreA, scoreB, coherenceA, coherenceB, 
  contradictionRate, confidence
});
```

### Frontend-Komponenten

- **`pages/index.js`**: Hauptseite mit State Management
- **`components/InputForm.js`**: Eingabeformular mit Beispielen  
- **`components/ResultDisplay.js`**: Score-Visualisierung und Urteil
- **`components/TreeView.js`**: Interaktive Darstellung der Argumentationsketten

## 🎯 Neutralität & Objektivität

> **"Als Creator Stephan Krol habe ich wenig Bedenken vor Irrlehren, da die Argumentationsketten nahezu gut sind und die KI-Methoden zur Dialektik und Wahrheitsfindung plausibel sind."**

### Wissenschaftlicher Ansatz
- ✅ **Neutrale KI-Bewertung** ohne vorgefasste Meinungen
- ✅ **Transparente Methodik** - alle Schritte sind nachvollziehbar
- ✅ **Open Source** - Code ist frei einsehbar und prüfbar
- ✅ **Strukturierte Dialektik** nach bewährten logischen Prinzipien

### Anwendungsbereiche
- 🔬 **Theologische Forschung** und Lehre
- 📚 **Bibelstudien** und Diskussionsgruppen  
- 🎓 **Bildungseinrichtungen** für kritisches Denken
- 💭 **Persönliche Reflexion** bei schwierigen Fragen

## 🔧 API-Referenz

### POST `/api/analyze`

Analysiert zwei biblische Thesen und gibt eine strukturierte Bewertung zurück.

**Request:**
```json
{
  "thesisA": "Glaube allein führt zur Erlösung",
  "thesisB": "Gute Werke sind notwendig für das ewige Leben"
}
```

**Response:**
```json
{
  "thesisA": "...",
  "thesisB": "...",
  "claimsA": ["claim1", "claim2", ...],
  "claimsB": ["claim1", "claim2", ...],
  "pairs": [
    {
      "claimA": "...",
      "claimB": "...",
      "analysisAB": { "label": "contradict", "score": 0.15, "reason": "..." },
      "analysisBA": { "label": "contradict", "score": 0.20, "reason": "..." },
      "debate": { "proA": "...", "proB": "...", "keyArguments": [...] }
    }
  ],
  "stats": {
    "totalPairs": 12,
    "contradictions": 8,
    "entailments": 2,
    "neutral": 2
  },
  "result": {
    "scoreA": 0.65,
    "scoreB": 0.42,
    "coherenceA": 0.78,
    "coherenceB": 0.61,
    "contradictionRate": 0.67,
    "verdict": "A",
    "confidence": 0.73,
    "summary": "...",
    "keyFindings": [...]
  }
}
```

## 📊 Tech Stack

| Technologie | Verwendung |
|-------------|------------|
| **Next.js 14** | React Framework, API Routes |
| **React 18** | UI Components, Hooks |
| **Framer Motion** | Animationen, Übergänge |
| **OpenAI SDK** | KI-API Integration |
| **JSON5** | Robust JSON Parsing |
| **React Icons** | UI Icon System |

## 🤝 Beitragen

Bible Fact Checker ist **Open Source** und lebt von der Community!

### Entwicklung
```bash
# Fork das Repository
# Clone deine Fork
git clone https://github.com/DEIN_USERNAME/bibleCheck.git

# Feature Branch erstellen
git checkout -b feature/amazing-feature

# Änderungen committen
git commit -m "Add amazing feature"

# Push und Pull Request erstellen
git push origin feature/amazing-feature
```

### Verbesserungsideen
- 🌍 **Mehrsprachigkeit** (Englisch, weitere Sprachen)
- 📖 **Erweiterte Bibelreferenzen** mit Vers-Verlinkung
- 🔍 **Historischer Kontext** in der Analyse
- 📱 **Mobile App** für iOS/Android
- 🎨 **Custom Themes** und Darstellungsoptionen

## 📝 Lizenz

Dieses Projekt steht unter einer **Open Source Lizenz**. Die App kann beliebig eingesetzt, modifiziert und weiterentwickelt werden.

## 👨‍💻 Creator

**Stephan Krol** - *Entwicklung und Konzeption*

Die Anwendung entstand aus der Überzeugung, dass objektive Analyse und kritisches Denken auch in theologischen Fragen wertvoll sind.

---

<p align="center">
  <strong>🔍 Entdecke Wahrheit durch Analyse • Gemacht mit ❤️ und KI</strong><br>
  <a href="https://biblecheck.io">Live Demo</a> • 
  <a href="https://github.com/dazzafact7/bibleCheck/issues">Issues</a> • 
  <a href="#beitragen">Beitragen</a>
</p>
