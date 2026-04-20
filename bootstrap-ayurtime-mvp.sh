#!/usr/bin/env bash
set -euo pipefail

REPO="${REPO:?missing REPO}"
MILESTONE_TITLE="${MILESTONE_TITLE:-AyurTime MVP – Phase 1 (30 days)}"
CREATE_LABELS="${CREATE_LABELS:-true}"
CREATE_ISSUES="${CREATE_ISSUES:-true}"

ensure_label() {
  local name="$1"
  local color="$2"
  local desc="$3"
  if gh label list --repo "$REPO" --limit 200 | awk -F '\t' '{print $1}' | grep -Fxq "$name"; then
    echo "Label exists: $name"
  else
    gh label create "$name" --repo "$REPO" --color "$color" --description "$desc"
    echo "Created label: $name"
  fi
}

get_milestone_number() {
  gh api "repos/$REPO/milestones?state=all&per_page=100" --jq '.[] | select(.title == env.MILESTONE_TITLE) | .number' | head -n 1
}

create_milestone_if_missing() {
  local n
  n="$(get_milestone_number || true)"
  if [ -n "$n" ]; then
    echo "Milestone exists: $MILESTONE_TITLE (#$n)"
    echo "$n"
  else
    gh api --method POST "repos/$REPO/milestones" -f title="$MILESTONE_TITLE" -f description='Phase 1 MVP for AyurTime focused on Vrat Calendar, Charaka Samhita knowledge module, and basic reminders/notifications for a responsive web MVP.' --jq '.number'
  fi
}

issue_exists() {
  local title="$1"
  gh issue list --repo "$REPO" --state all --search "$title in:title" --json title --jq '.[].title' | grep -Fxq "$title"
}

create_issue_if_missing() {
  local title="$1"
  local labels="$2"
  local body_file="$3"
  local milestone_number="$4"

  if issue_exists "$title"; then
    echo "Issue exists: $title"
  else
    gh issue create --repo "$REPO" --title "$title" --body-file "$body_file" --label "$labels" --milestone "$milestone_number"
    echo "Created issue: $title"
  fi
}

mkdir -p /tmp/ayurtime-bodies

cat > /tmp/ayurtime-bodies/issue1.md <<'BODY'
## Summary
Decide and document the Phase 1 web MVP stack and folder structure for AyurTime.

## Goal
Lock the technical base for the 30-day MVP so development can begin without scope drift.

## Scope
- Confirm responsive web MVP as Phase 1 platform
- Finalize frontend approach inside `packages/web`
- Confirm basic routing/layout approach
- Confirm data storage format for initial vrat and Charaka content

## Deliverables
- Short architecture note in `docs/`
- Final folder structure decision
- Tech stack decision recorded in README or technical docs

## Acceptance criteria
- [ ] Platform for Phase 1 confirmed as responsive web MVP
- [ ] Main web stack documented
- [ ] Data format for initial MVP content documented
- [ ] Repo structure for MVP agreed

## Notes
Do not expand into mobile apps or AI chat in this issue.
BODY

cat > /tmp/ayurtime-bodies/issue2.md <<'BODY'
## Summary
Build the main responsive shell for AyurTime Phase 1.

## Goal
Create a usable app structure that connects the four core sections: Home, Calendar, Knowledge, and Alerts.

## Scope
- Header and app title
- Main navigation
- Responsive layout for mobile and desktop
- Placeholder pages for each section

## Deliverables
- Base layout in `packages/web`
- Navigation links working between sections
- Responsive shell for MVP demo

## Acceptance criteria
- [ ] Home page exists
- [ ] Calendar page exists
- [ ] Knowledge page exists
- [ ] Alerts page exists
- [ ] Navigation works between all pages
- [ ] Layout is usable on mobile width

## Notes
Keep design simple and practical; focus on usable structure over polish.
BODY

cat > /tmp/ayurtime-bodies/issue3.md <<'BODY'
## Summary
Create the first static version of the Vrat Calendar page for the web MVP.

## Goal
Prepare a screen that can later be connected to curated vrat data.

## Scope
- Upcoming vrat list section
- Monthly calendar or date list section
- Placeholder detail panel/card
- Simple empty/loading states

## Deliverables
- Static page structure for Vrat Calendar
- Layout ready for data integration in next sprint

## Acceptance criteria
- [ ] Upcoming vrat section exists
- [ ] Monthly/date section exists
- [ ] Placeholder details area exists
- [ ] Page is responsive

## Notes
No real data integration required in this issue.
BODY

cat > /tmp/ayurtime-bodies/issue4.md <<'BODY'
## Summary
Create the initial UI skeleton for the Charaka Samhita knowledge module.

## Goal
Prepare a structured knowledge experience inside AyurTime.

## Scope
- Charaka section/sthana listing view
- Chapter list view
- Chapter detail/reading view
- Placeholder search/filter area

## Deliverables
- Static knowledge module UI skeleton
- Layout ready for content integration later

## Acceptance criteria
- [ ] Sthana or section list exists
- [ ] Chapter list exists
- [ ] Chapter detail view exists
- [ ] Search/filter placeholder exists
- [ ] UI is responsive

## Notes
Keep this as a knowledge library, not an AI chat feature.
BODY

cat > /tmp/ayurtime-bodies/issue5.md <<'BODY'
## Summary
Create the first alerts/settings page for AyurTime reminders.

## Goal
Provide a place where users can view and manage basic reminder preferences.

## Scope
- Reminder toggle area
- Placeholder timing settings
- Placeholder saved vrats or saved chapters list
- Simple explanatory text for Phase 1 limitations

## Deliverables
- Static alerts/settings page
- Structure ready for reminder integration

## Acceptance criteria
- [ ] Reminder settings section exists
- [ ] Placeholder timing controls exist
- [ ] Saved items placeholder exists
- [ ] Page is responsive

## Notes
No push notification backend is required in this issue.
BODY

cat > /tmp/ayurtime-bodies/issue6.md <<'BODY'
## Summary
Organize GitHub workflow for AyurTime Phase 1 MVP execution.

## Goal
Create a visible project management structure for the next 30 days.

## Scope
- Create milestone: AyurTime MVP – Phase 1 (30 days)
- Confirm labels for features and work types
- Create project board with core status columns
- Add Week 1 issues to the board

## Deliverables
- Milestone created
- Labels confirmed or added
- Project board created
- Week 1 issues linked to board

## Acceptance criteria
- [ ] Milestone exists
- [ ] Labels exist for feature/frontend/backend/planning/bug
- [ ] Project board exists
- [ ] Core Week 1 issues are added to board

## Notes
This is an execution setup issue, not product development.
BODY

if [ "$CREATE_LABELS" = "true" ]; then
  ensure_label "feature" "1D76DB" "New product feature"
  ensure_label "frontend" "5319E7" "Frontend or UI work"
  ensure_label "planning" "0E8A16" "Planning and project setup"
  ensure_label "architecture" "BFD4F2" "Architecture and structure"
  ensure_label "calendar" "FBCA04" "Calendar and vrat functionality"
  ensure_label "knowledge-base" "C2E0C6" "Knowledge module and texts"
  ensure_label "notifications" "D93F0B" "Reminders and notifications"
  ensure_label "ui" "F9D0C4" "User interface work"
  ensure_label "project-management" "7057FF" "Workflow and execution tracking"
fi

MILESTONE_NUMBER="$(create_milestone_if_missing)"
echo "Using milestone number: $MILESTONE_NUMBER"

if [ "$CREATE_ISSUES" = "true" ]; then
  create_issue_if_missing "Decide web tech stack and repo structure for AyurTime MVP" "planning,architecture" /tmp/ayurtime-bodies/issue1.md "$MILESTONE_NUMBER"
  create_issue_if_missing "Implement base layout shell with navigation (Home, Calendar, Knowledge, Alerts)" "feature,frontend,ui" /tmp/ayurtime-bodies/issue2.md "$MILESTONE_NUMBER"
  create_issue_if_missing "Create static Calendar page skeleton for Vrat Calendar MVP" "feature,frontend,calendar" /tmp/ayurtime-bodies/issue3.md "$MILESTONE_NUMBER"
  create_issue_if_missing "Create static Charaka list and chapter page skeleton" "feature,frontend,knowledge-base" /tmp/ayurtime-bodies/issue4.md "$MILESTONE_NUMBER"
  create_issue_if_missing "Create static Alerts and reminder settings page skeleton" "feature,frontend,notifications" /tmp/ayurtime-bodies/issue5.md "$MILESTONE_NUMBER"
  create_issue_if_missing "Set up AyurTime MVP Phase 1 milestone, labels, and project board workflow" "planning,project-management" /tmp/ayurtime-bodies/issue6.md "$MILESTONE_NUMBER"
fi

echo "Bootstrap completed."
