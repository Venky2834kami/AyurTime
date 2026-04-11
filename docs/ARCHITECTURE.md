# Architecture Overview

This document summarizes the high-level architecture for AyurTime.

Components
- Frontend: React (mobile / web) — interacts with the API.
- Agent Service: FastAPI (Python) — provides Ayurvedic recommendation engine and on-device sync adapters.
- Worker/Sync: Background jobs to handle data aggregation and model updates.
- Storage: MongoDB (or chosen persistent store) for user profiles, events, and recommendations.
- Telemetry & Analytics: Separate service for analytics and compliance reporting.

Data flow
1. Sensors & watch clients -> local phone/watch agent -> API (Agent Service).
2. Agent Service fuses sensor data, user profile and context, returns recommendations.
3. Recommendations are stored and optionally synchronized for analytics.

Notes
- Keep model runtime small for on-device inference & provide a cloud augmentation path.
- Secure sensitive health data at rest and in transit (TLS + encryption at rest).