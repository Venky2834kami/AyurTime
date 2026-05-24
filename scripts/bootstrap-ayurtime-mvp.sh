#!/usr/bin/env bash
set -euo pipefail

REPO="${REPO:?missing REPO}"
MILESTONE_TITLE="${MILESTONE_TITLE:-AyurTime MVP - Phase 1 (30 days)}"
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

if [ "$CREATE_LABELS" = "true" ]; then
  ensure_label "feature"            "1D76DB" "New product feature"
  ensure_label "frontend"           "5319E7" "Frontend or UI work"
  ensure_label "planning"           "0E8A16" "Planning and project setup"
  ensure_label "architecture"       "BFD4F2" "Architecture and structure"
  ensure_label "calendar"           "FBCA04" "Calendar and vrat functionality"
  ensure_label "knowledge-base"     "C2E0C6" "Knowledge module and texts"
  ensure_label "notifications"      "D93F0B" "Reminders and notifications"
  ensure_label "ui"                 "F9D0C4" "User interface work"
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
