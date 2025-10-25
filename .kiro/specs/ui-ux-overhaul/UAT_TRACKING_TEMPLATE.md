# UAT Session Tracking Spreadsheet Template

Copy this to Google Sheets or Excel for tracking UAT sessions.

---

## Sheet 1: Participant Overview

| ID | Name | Email | Role | Experience | Practice Area | Tech Level | Scheduled Date | Status | Completed |
|----|------|-------|------|------------|---------------|------------|----------------|--------|-----------|
| P1 | | | Advocate | Senior (10+) | Litigation | High | 2025-01-20 | Scheduled | ⏳ |
| P2 | | | Attorney | Mid (5yr) | Corporate | Medium | 2025-01-21 | Scheduled | ⏳ |
| P3 | | | Paralegal | Junior (2yr) | Family Law | Low | 2025-01-22 | Scheduled | ⏳ |
| P4 | | | Advocate | Senior (15+) | Criminal | Medium | 2025-01-23 | Scheduled | ⏳ |
| P5 | | | Attorney | Mid (7yr) | Property | High | 2025-01-24 | Scheduled | ⏳ |
| P6 | | | | | | | | Available | ⏳ |
| P7 | | | | | | | | Available | ⏳ |
| P8 | | | | | | | | Available | ⏳ |
| P9 | | | | | | | | Available | ⏳ |
| P10 | | | | | | | | Available | ⏳ |

**Status Options:** Available | Scheduled | Completed | Cancelled

---

## Sheet 2: Task Completion Matrix

| Participant | Date | S1: Matter Mgmt | S2: Invoice | S3: Dashboard | S4: Settings | S5: Mobile | S6: Error | Overall Success |
|-------------|------|-----------------|-------------|---------------|--------------|------------|-----------|-----------------|
| P1 | | 4.2m ✅ | 3.5m ✅ | 2.0m ✅ | 4.8m ⚠️ | 6.2m ✅ | 3.9m ✅ | 83% |
| P2 | | | | | | | | |
| P3 | | | | | | | | |
| P4 | | | | | | | | |
| P5 | | | | | | | | |
| **Average** | | **X.Xm** | **X.Xm** | **X.Xm** | **X.Xm** | **X.Xm** | **X.Xm** | **XX%** |
| **Target** | | <5.0m | <4.0m | <3.0m | <3.0m | <8.0m | <5.0m | >80% |
| **Status** | | ✅/❌ | ✅/❌ | ✅/❌ | ✅/❌ | ✅/❌ | ✅/❌ | ✅/❌ |

**Legend:**
- ✅ Success (within target time, no critical errors)
- ⚠️ Partial (completed but with issues or over time)
- ❌ Failed (couldn't complete or abandoned)
- Time format: X.Xm (minutes)

---

## Sheet 3: Issue Log

| ID | Issue Description | Severity | Frequency | Affected Scenarios | Participants | Impact | Priority | Est. Fix | Status |
|----|-------------------|----------|-----------|-------------------|--------------|--------|----------|----------|--------|
| I001 | | Critical | 8/10 | S1, S2 | P1,P2,P3,P4,P5,P6,P7,P8 | High | P0 | 2h | 🔴 Open |
| I002 | | Major | 5/10 | S4 | P1,P3,P5,P7,P9 | Medium | P1 | 4h | 🔴 Open |
| I003 | | Minor | 2/10 | S5 | P2,P8 | Low | P2 | 1h | 🔴 Open |
| I004 | | | | | | | | | |
| I005 | | | | | | | | | |

**Severity:**
- Critical: Blocks task completion or causes data loss
- Major: Significant frustration or workarounds needed
- Minor: Cosmetic or minor inconvenience

**Priority:**
- P0: Fix immediately (1-2 days)
- P1: Fix in next sprint (1 week)
- P2: Fix in next release (2-4 weeks)
- P3: Backlog (as time permits)

**Status:**
- 🔴 Open
- 🟡 In Progress
- 🟢 Fixed
- ✅ Verified

---

## Sheet 4: Satisfaction Scores

| Participant | Overall (1-10) | Ease of Use | Features | Visual Design | Mobile | Would Use? | NPS Score | Notes |
|-------------|----------------|-------------|----------|---------------|--------|------------|-----------|-------|
| P1 | 8 | 7 | 9 | 8 | 6 | Yes | Promoter | "Love the dashboard" |
| P2 | | | | | | | | |
| P3 | | | | | | | | |
| P4 | | | | | | | | |
| P5 | | | | | | | | |
| **Average** | **X.X** | **X.X** | **X.X** | **X.X** | **X.X** | **XX%** | **XX** | |
| **Target** | >7.0 | >7.0 | >7.0 | >7.0 | >6.0 | >70% | >50 | |

**NPS Categories:**
- Promoter (9-10): Very likely to recommend
- Passive (7-8): Satisfied but not enthusiastic
- Detractor (0-6): Unlikely to recommend

**NPS Score Calculation:** % Promoters - % Detractors

---

## Sheet 5: Feature Requests

| ID | Feature Request | Requested By | Count | Business Value | Effort | Priority | Status | Notes |
|----|-----------------|--------------|-------|----------------|--------|----------|--------|-------|
| FR001 | Auto-save in matter wizard | P1, P3, P5 | 3 | High | Medium | High | 🔴 Open | Prevents data loss |
| FR002 | Bulk email invoices | P2, P4 | 2 | Medium | Low | Medium | 🔴 Open | Saves time |
| FR003 | | | | | | | | |
| FR004 | | | | | | | | |
| FR005 | | | | | | | | |

**Business Value:**
- High: Significantly improves productivity or prevents major issues
- Medium: Notable improvement but not critical
- Low: Nice to have

**Effort:**
- Low: <4 hours
- Medium: 1-2 days
- High: 3-5 days
- Very High: >1 week

---

## Sheet 6: Quotes & Verbatim

| Participant | Quote | Context | Sentiment |
|-------------|-------|---------|-----------|
| P1 | "This is exactly what we need for our firm" | After invoice generation | 😊 Positive |
| P1 | "I got lost trying to find the settings" | During scenario 4 | 😕 Negative |
| P2 | | | |
| P3 | | | |

**Sentiment:**
- 😊 Positive
- 😐 Neutral
- 😕 Negative

---

## Sheet 7: Time Analysis

| Scenario | Target | P1 | P2 | P3 | P4 | P5 | P6 | P7 | P8 | P9 | P10 | Avg | Min | Max | Median |
|----------|--------|----|----|----|----|----|----|----|----|----|----|-----|-----|-----|--------|
| S1: Matter Mgmt | <5.0m | 4.2 | | | | | | | | | | X.X | X.X | X.X | X.X |
| S2: Invoice | <4.0m | 3.5 | | | | | | | | | | X.X | X.X | X.X | X.X |
| S3: Dashboard | <3.0m | 2.0 | | | | | | | | | | X.X | X.X | X.X | X.X |
| S4: Settings | <3.0m | 4.8 | | | | | | | | | | X.X | X.X | X.X | X.X |
| S5: Mobile | <8.0m | 6.2 | | | | | | | | | | X.X | X.X | X.X | X.X |
| S6: Error | <5.0m | 3.9 | | | | | | | | | | X.X | X.X | X.X | X.X |
| **Total** | <28m | 24.6 | | | | | | | | | | X.X | X.X | X.X | X.X |

**Analysis:**
- Scenarios over target time: [List]
- Fastest completion: S3 (Dashboard) - X.Xm average
- Slowest completion: S5 (Mobile) - X.Xm average
- Overall efficiency: XX% within target

---

## Sheet 8: Demographics Summary

| Metric | Count | Percentage |
|--------|-------|------------|
| **Total Participants** | 10 | 100% |
| | | |
| **Experience Level** | | |
| Senior (10+ years) | 3 | 30% |
| Mid-level (3-10 years) | 4 | 40% |
| Junior (0-3 years) | 3 | 30% |
| | | |
| **Role** | | |
| Advocate | 5 | 50% |
| Attorney | 4 | 40% |
| Paralegal | 1 | 10% |
| | | |
| **Practice Area** | | |
| Litigation | 3 | 30% |
| Corporate | 2 | 20% |
| Criminal | 2 | 20% |
| Family Law | 1 | 10% |
| Property | 1 | 10% |
| Other | 1 | 10% |
| | | |
| **Tech Proficiency** | | |
| High | 3 | 30% |
| Medium | 5 | 50% |
| Low | 2 | 20% |

---

## Sheet 9: Action Items

| ID | Action Item | Owner | Due Date | Priority | Status | Blocker | Verified |
|----|-------------|-------|----------|----------|--------|---------|----------|
| A001 | Fix navigation confusion (I001) | Dev Team | 2025-01-25 | P0 | 🟡 In Progress | None | ⏳ |
| A002 | Add auto-save feature (FR001) | Dev Team | 2025-02-01 | P1 | 🔴 Open | None | ⏳ |
| A003 | Improve mobile touch targets | Dev Team | 2025-01-27 | P0 | 🔴 Open | None | ⏳ |
| A004 | | | | | | | |
| A005 | | | | | | | |

**Status:**
- 🔴 Open (not started)
- 🟡 In Progress (being worked on)
- 🟢 Fixed (code complete)
- ✅ Verified (tested and confirmed)

---

## Sheet 10: Session Schedule

| Date | Time | Participant | Format | Location | Moderator | Status | Recording Link | Notes Link |
|------|------|-------------|--------|----------|-----------|--------|----------------|------------|
| 2025-01-20 | 10:00 | P1 | Zoom | Remote | [Name] | ✅ Complete | [Link] | [Link] |
| 2025-01-20 | 14:00 | P2 | Zoom | Remote | [Name] | ⏳ Scheduled | | |
| 2025-01-21 | 09:00 | P3 | Teams | Remote | [Name] | ⏳ Scheduled | | |
| 2025-01-21 | 15:00 | P4 | In-person | Office | [Name] | ⏳ Scheduled | | |
| 2025-01-22 | 11:00 | P5 | Zoom | Remote | [Name] | ⏳ Scheduled | | |
| 2025-01-23 | 10:00 | P6 | | | [Name] | 📅 Available | | |
| 2025-01-23 | 14:00 | P7 | | | [Name] | 📅 Available | | |
| 2025-01-24 | 09:00 | P8 | | | [Name] | 📅 Available | | |
| 2025-01-24 | 13:00 | P9 | | | [Name] | 📅 Available | | |
| 2025-01-25 | 10:00 | P10 | | | [Name] | 📅 Available | | |

---

## How to Use This Template

1. **Make a copy** of this file
2. **Share with team** for collaborative tracking
3. **Update during sessions** to capture live data
4. **Review weekly** to track progress
5. **Export reports** from individual sheets as needed

## Formulas to Add

**Sheet 2 - Calculate Success Rate:**
```
=COUNTIF(B2:G2,"✅")/6*100
```

**Sheet 4 - Calculate NPS:**
```
=(COUNTIF(B:B,">=9")/COUNTA(B:B)*100)-(COUNTIF(B:B,"<=6")/COUNTA(B:B)*100)
```

**Sheet 7 - Calculate Average:**
```
=AVERAGE(B2:K2)
```

Good luck with your UAT tracking! 📊
