# PlagaAlert

PlagaAlert is a crop risk monitoring tool that predicts potential pest outbreaks based on environmental conditions and geospatial data.

The goal of the project is to provide farmers, agronomists, and decision-makers with an early warning system that helps anticipate pest risks and take preventive actions before damage occurs.

---

## Overview

The application is composed of two main parts:

- **Frontend (React + Vite)**  
  Handles user interaction, geolocation input, and visualization of risk analysis and evolution.

- **Backend (FastAPI + Python)**  
  Processes environmental data, runs the risk model, and integrates AI-based insights.

---

## How it works

1. The user selects a precise location on the map and chooses a crop.
2. The frontend sends this data to the backend.
3. The backend:
   - Fetches environmental data (weather, humidity, rainfall, etc.)
   - Runs a risk model based on predefined thresholds
   - Generates a structured prediction
   - (Optional) Enhances the output with AI insights
4. The frontend displays:
   - Risk score and level
   - Key environmental factors
   - Recommendations
   - Risk evolution simulation

---
## Deployment

The project is designed to be deployed as two independent services:

- **Frontend:** Vercel (Vite build)
- **Backend:** Vercel (Python / FastAPI)

---
## Purpose

This project was built as part of a hackathon to demonstrate how real-time environmental data combined with AI can be used to anticipate agricultural risks and improve decision-making.

---

## Notes

- This is a functional prototype focused on demonstrating the concept.
- The risk model can be expanded with more agronomic variables and historical datasets.
- AI insights can be further refined with domain-specific prompts.
