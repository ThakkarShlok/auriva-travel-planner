import React from 'react'
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer'

// Uses React.createElement throughout (no JSX) so this file can be imported
// by Node.js API handlers without requiring a JSX transform.

const PALETTE = {
  indigo: '#4f46e5',
  indigoDark: '#3730a3',
  amber: '#f59e0b',
  white: '#ffffff',
  slate900: '#0f172a',
  slate700: '#334155',
  slate500: '#64748b',
  slate200: '#e2e8f0',
  slate100: '#f1f5f9',
  indigoLight: '#c7d2fe',
}

const styles = StyleSheet.create({
  page: {
    backgroundColor: PALETTE.white,
    fontFamily: 'Helvetica',
  },

  // ── Cover ─────────────────────────────────────────────────────────────────
  coverHero: {
    backgroundColor: PALETTE.indigo,
    paddingTop: 72,
    paddingBottom: 72,
    paddingLeft: 48,
    paddingRight: 48,
  },
  coverEyebrow: {
    fontSize: 9,
    color: PALETTE.amber,
    letterSpacing: 3,
    marginBottom: 16,
  },
  coverTitle: {
    fontSize: 38,
    fontFamily: 'Helvetica-Bold',
    color: PALETTE.white,
    marginBottom: 12,
  },
  coverSubtitle: {
    fontSize: 13,
    color: PALETTE.indigoLight,
  },
  coverBody: {
    paddingTop: 44,
    paddingLeft: 48,
    paddingRight: 48,
    paddingBottom: 48,
  },
  coverOverview: {
    fontSize: 11,
    color: PALETTE.slate700,
    lineHeight: 1.75,
    marginBottom: 32,
  },
  coverNote: {
    fontSize: 9,
    color: PALETTE.slate500,
    marginTop: 16,
  },

  // ── Day page ──────────────────────────────────────────────────────────────
  dayHero: {
    backgroundColor: PALETTE.indigo,
    paddingTop: 28,
    paddingBottom: 28,
    paddingLeft: 40,
    paddingRight: 40,
  },
  dayEyebrow: {
    fontSize: 8,
    color: PALETTE.amber,
    letterSpacing: 2,
    marginBottom: 6,
  },
  dayTitle: {
    fontSize: 20,
    fontFamily: 'Helvetica-Bold',
    color: PALETTE.white,
  },
  activitiesContainer: {
    paddingTop: 24,
    paddingLeft: 40,
    paddingRight: 40,
    paddingBottom: 48,
  },
  activityRow: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  activityTimeCol: {
    width: 52,
    marginRight: 12,
    paddingTop: 2,
  },
  activityTime: {
    fontSize: 8,
    fontFamily: 'Helvetica-Bold',
    color: PALETTE.indigo,
  },
  activityContent: {
    flex: 1,
    paddingLeft: 12,
    paddingBottom: 14,
    borderLeftWidth: 2,
    borderLeftColor: PALETTE.slate200,
    borderLeftStyle: 'solid',
  },
  activityTitle: {
    fontSize: 12,
    fontFamily: 'Helvetica-Bold',
    color: PALETTE.slate900,
    marginBottom: 4,
  },
  activityDescription: {
    fontSize: 9,
    color: PALETTE.slate700,
    lineHeight: 1.55,
    marginBottom: 3,
  },
  activityCost: {
    fontSize: 9,
    fontFamily: 'Helvetica-Bold',
    color: PALETTE.indigo,
    marginTop: 2,
  },

  // ── Summary page ──────────────────────────────────────────────────────────
  summaryHero: {
    backgroundColor: PALETTE.indigoDark,
    paddingTop: 28,
    paddingBottom: 28,
    paddingLeft: 40,
    paddingRight: 40,
  },
  summaryHeroEyebrow: {
    fontSize: 8,
    color: PALETTE.amber,
    letterSpacing: 2,
    marginBottom: 6,
  },
  summaryHeroTitle: {
    fontSize: 20,
    fontFamily: 'Helvetica-Bold',
    color: PALETTE.white,
  },
  summaryBody: {
    paddingTop: 20,
    paddingLeft: 40,
    paddingRight: 40,
    paddingBottom: 48,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 22,
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 11,
    fontFamily: 'Helvetica-Bold',
    color: PALETTE.slate900,
  },
  sectionDivider: {
    flex: 1,
    height: 1,
    backgroundColor: PALETTE.slate200,
    marginLeft: 10,
    marginTop: 1,
  },
  listItem: {
    fontSize: 10,
    color: PALETTE.slate700,
    marginBottom: 5,
    lineHeight: 1.5,
  },
  budgetRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingBottom: 5,
    marginBottom: 5,
    borderBottomWidth: 1,
    borderBottomColor: PALETTE.slate100,
    borderBottomStyle: 'solid',
  },
  budgetKey: {
    fontSize: 10,
    color: PALETTE.slate700,
  },
  budgetValue: {
    fontSize: 10,
    fontFamily: 'Helvetica-Bold',
    color: PALETTE.slate900,
  },

  // ── Page footer ───────────────────────────────────────────────────────────
  pageFooter: {
    position: 'absolute',
    bottom: 20,
    left: 40,
    right: 40,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  pageFooterText: {
    fontSize: 8,
    color: PALETTE.slate500,
  },
})

// ── Sub-components ────────────────────────────────────────────────────────────

function PageFooter({ label }) {
  return React.createElement(View, { style: styles.pageFooter, fixed: true },
    React.createElement(Text, { style: styles.pageFooterText }, label || 'Auriva · auriva.app'),
    React.createElement(Text, {
      style: styles.pageFooterText,
      render: ({ pageNumber, totalPages }) => `${pageNumber} / ${totalPages}`,
    }),
  )
}

function CoverPage({ trip }) {
  return React.createElement(Page, { size: 'A4', style: styles.page },
    React.createElement(View, { style: styles.coverHero },
      React.createElement(Text, { style: styles.coverEyebrow }, 'AURIVA · AI TRAVEL STRATEGIST'),
      React.createElement(Text, { style: styles.coverTitle }, trip.destination),
      React.createElement(Text, { style: styles.coverSubtitle },
        `${trip.duration} days · ${trip.travelers} traveler${trip.travelers !== 1 ? 's' : ''} · ${trip.budget} budget`,
      ),
    ),
    React.createElement(View, { style: styles.coverBody },
      trip.overview
        ? React.createElement(Text, { style: styles.coverOverview }, trip.overview)
        : null,
      React.createElement(Text, { style: styles.coverNote },
        'This itinerary was AI-generated by Auriva. Verify all details before booking.',
      ),
    ),
    React.createElement(PageFooter, { label: 'Auriva · AI Travel Strategist' }),
  )
}

function DayPage({ day, dayNumber }) {
  const activities = Array.isArray(day.activities) ? day.activities : []

  const activityEls = activities.map((activity, idx) =>
    React.createElement(View, { key: idx, style: styles.activityRow },
      React.createElement(View, { style: styles.activityTimeCol },
        React.createElement(Text, { style: styles.activityTime },
          activity.time || `${9 + idx}:00`,
        ),
      ),
      React.createElement(View, { style: styles.activityContent },
        React.createElement(Text, { style: styles.activityTitle },
          activity.title || 'Activity',
        ),
        activity.description
          ? React.createElement(Text, { style: styles.activityDescription }, activity.description)
          : null,
        activity.cost > 0
          ? React.createElement(Text, { style: styles.activityCost }, `~$${activity.cost}`)
          : null,
      ),
    )
  )

  return React.createElement(Page, { size: 'A4', style: styles.page },
    React.createElement(View, { style: styles.dayHero },
      React.createElement(Text, { style: styles.dayEyebrow }, `DAY ${dayNumber}`),
      React.createElement(Text, { style: styles.dayTitle }, day.title || `Day ${dayNumber}`),
    ),
    React.createElement(View, { style: styles.activitiesContainer }, ...activityEls),
    React.createElement(PageFooter, { label: `Day ${dayNumber} · Auriva` }),
  )
}

function SummaryPage({ trip }) {
  const budgetEntries = trip.budgetBreakdown ? Object.entries(trip.budgetBreakdown) : []
  const hotels = Array.isArray(trip.hotels) ? trip.hotels : []
  const packing = Array.isArray(trip.packing) ? trip.packing : []
  const tips = Array.isArray(trip.tips) ? trip.tips : []

  if (!budgetEntries.length && !hotels.length && !packing.length && !tips.length) return null

  const bodyChildren = []

  if (budgetEntries.length > 0) {
    bodyChildren.push(
      React.createElement(View, { key: 'budget-hdr', style: styles.sectionHeader },
        React.createElement(Text, { style: styles.sectionTitle }, 'Budget Breakdown'),
        React.createElement(View, { style: styles.sectionDivider }),
      ),
      ...budgetEntries.map(([key, value], idx) =>
        React.createElement(View, { key: `b${idx}`, style: styles.budgetRow },
          React.createElement(Text, { style: styles.budgetKey },
            key.charAt(0).toUpperCase() + key.slice(1),
          ),
          React.createElement(Text, { style: styles.budgetValue }, `$${value}`),
        )
      ),
    )
  }

  if (hotels.length > 0) {
    bodyChildren.push(
      React.createElement(View, { key: 'hotels-hdr', style: styles.sectionHeader },
        React.createElement(Text, { style: styles.sectionTitle }, 'Recommended Hotels'),
        React.createElement(View, { style: styles.sectionDivider }),
      ),
      ...hotels.map((hotel, idx) =>
        React.createElement(Text, { key: `h${idx}`, style: styles.listItem }, `• ${hotel}`)
      ),
    )
  }

  if (packing.length > 0) {
    bodyChildren.push(
      React.createElement(View, { key: 'packing-hdr', style: styles.sectionHeader },
        React.createElement(Text, { style: styles.sectionTitle }, 'Packing List'),
        React.createElement(View, { style: styles.sectionDivider }),
      ),
      ...packing.map((item, idx) =>
        React.createElement(Text, { key: `p${idx}`, style: styles.listItem }, `· ${item}`)
      ),
    )
  }

  if (tips.length > 0) {
    bodyChildren.push(
      React.createElement(View, { key: 'tips-hdr', style: styles.sectionHeader },
        React.createElement(Text, { style: styles.sectionTitle }, 'Travel Tips'),
        React.createElement(View, { style: styles.sectionDivider }),
      ),
      ...tips.map((tip, idx) =>
        React.createElement(Text, { key: `t${idx}`, style: styles.listItem }, `• ${tip}`)
      ),
    )
  }

  return React.createElement(Page, { size: 'A4', style: styles.page },
    React.createElement(View, { style: styles.summaryHero },
      React.createElement(Text, { style: styles.summaryHeroEyebrow }, 'TRIP SUMMARY'),
      React.createElement(Text, { style: styles.summaryHeroTitle }, 'Hotels · Packing · Tips'),
    ),
    React.createElement(View, { style: styles.summaryBody }, ...bodyChildren),
    React.createElement(PageFooter, { label: 'Generated by Auriva · auriva.app' }),
  )
}

// ── Main export ───────────────────────────────────────────────────────────────

export function TripPDFDocument({ trip }) {
  const days = Array.isArray(trip.days) ? trip.days : []

  const pages = [
    React.createElement(CoverPage, { key: 'cover', trip }),
    ...days.map((day, idx) =>
      React.createElement(DayPage, { key: `day-${idx}`, day, dayNumber: idx + 1 })
    ),
    React.createElement(SummaryPage, { key: 'summary', trip }),
  ].filter(Boolean)

  return React.createElement(Document, {
    title: `${trip.duration} days in ${trip.destination} — Auriva`,
    author: 'Auriva',
    subject: `AI-generated travel itinerary for ${trip.destination}`,
    creator: 'Auriva AI Travel Strategist',
  }, ...pages)
}
