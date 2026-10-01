import { CbaRuleArticle } from '../types';

export const CBA_RULES_DATABASE: CbaRuleArticle[] = [
  {
    article_number: 'Article VII',
    section: 'Section 2(e)',
    title: 'First and Second Apron Thresholds',
    summary: 'Defines the First Apron (approx. $8M above the Tax Level) and Second Apron (approx. $11.9M above First Apron) and their systemic operational consequences.',
    plain_english: 'The 2023 CBA introduced two distinct "aprons" above the luxury tax line. Crossing either threshold strips away key transactional mechanisms (MLE, aggregation, cash, pick trades).',
    restrictions: [
      'Teams above the First Apron cannot take back more salary in a trade than they send out (100% incoming cap match limit).',
      'Teams above the Second Apron cannot aggregate multiple player contracts to match incoming salary in a trade.',
      'Teams above the Second Apron cannot send cash in any trade.',
      'Teams above the Second Apron cannot acquire a player via a previously created Traded Player Exception (TPE).',
    ],
    first_apron_consequences: [
      'Trade salary matching restricted to 100% of outgoing salary (no 110% or 125% buffer).',
      'Cannot sign a buyout player who previously made more than the Non-Taxpayer Mid-Level Exception.',
      'Using the Non-Taxpayer MLE, Bi-Annual Exception, or acquiring a player via Sign-and-Trade hard caps the team at the First Apron for the entire league year.',
    ],
    second_apron_consequences: [
      'Zero aggregation of player salaries allowed in any trade transaction.',
      'Complete loss of the Taxpayer Mid-Level Exception (cannot sign any free agent using an exception other than minimum contracts).',
      'Prohibited from sending cash considerations in trades.',
      'Prohibited from trading first-round draft picks 7 years out (frozen pick rule). If a team finishes in the Second Apron in 2 of 4 seasons, that frozen pick drops to pick #30.',
    ],
  },
  {
    article_number: 'Article VII',
    section: 'Section 3(c)',
    title: 'Trade Salary Matching & Aggregation',
    summary: 'Governs allowable incoming salary multipliers for non-taxpayer, taxpayer, and apron teams.',
    plain_english: 'Under-the-cap and standard tax teams have percentage bands (up to 125% or 200% for lower amounts) to take back extra salary. Once a team crosses the First Apron, it cannot take back even $1 more than it ships out. At the Second Apron, two or more players can never be combined to match one larger incoming contract.',
    restrictions: [
      'First Apron: Incoming salary must be <= 100% of outgoing salary.',
      'Second Apron: Outgoing player contracts must be evaluated 1-for-1. Aggregating two $10M players to acquire one $19M player is strictly prohibited.',
      'Traded Player Exceptions (TPE) generated in prior trades cannot be used by Second Apron teams to absorb players.',
    ],
  },
  {
    article_number: 'Article VII',
    section: 'Section 9(b)',
    title: 'Sign-and-Trade Transactions and Hard Caps',
    summary: 'Rules for executing free agent sign-and-trades and subsequent hard cap ceilings.',
    plain_english: 'Acquiring any player via sign-and-trade immediately triggers an unbendable hard cap at the First Apron for the remainder of that league year (through June 30).',
    restrictions: [
      'The acquiring team cannot cross the First Apron under ANY circumstance after completing a sign-and-trade.',
      'The contract must be for a minimum of 3 years and maximum of 4 years.',
      'First-year salary cannot be fully non-guaranteed.',
    ],
  },
  {
    article_number: 'Article VII',
    section: 'Section 10',
    title: 'Frozen Draft Picks (Second Apron Penalty)',
    summary: 'Draft pick asset restrictions incurred by teams exceeding the Second Apron.',
    plain_english: 'Teams that end the regular season above the Second Apron have their first-round pick 7 years in the future frozen from being traded. Repeat offenders (2 times in 4 years) have that pick automatically relegated to the end of the first round (30th pick) regardless of their lottery standings.',
    restrictions: [
      'Immediate trade ban on the first-round pick 7 seasons out.',
      'Draft position re-seeded to 30th overall upon second apron breach within 4 rolling seasons.',
    ],
  },
  {
    article_number: 'Article XI',
    section: 'Section 4',
    title: 'Veteran Contract Extensions',
    summary: 'Permitted salary bumps and timelines for extending veteran players under standard NBA contracts.',
    plain_english: 'Under the 2023 CBA, maximum extension starting salaries were increased from 120% to 140% of the previous salary (or 140% of the estimated average player salary, whichever is greater).',
    restrictions: [
      'Players with 3 or 4-year contracts may be extended after the 2nd anniversary of signing.',
      'Players with 5-year contracts may be extended after the 3rd anniversary.',
      'First year of extension capped at 140% of prior year salary or 140% of league average player salary.',
    ],
  },
  {
    article_number: 'Article XXIX',
    section: 'Section 2',
    title: 'Two-Way Contracts and G League Assignments',
    summary: 'Roster limits, service day maximums, and financial rules governing Two-Way and G League players.',
    plain_english: 'Each NBA team can carry up to 3 Two-Way players (in addition to the 15-player standard roster). Two-Way players earn 50% of the rookie minimum salary and do not count against the NBA salary cap or luxury tax unless converted.',
    restrictions: [
      'Maximum 3 Two-Way players per team.',
      'Active list limit of 50 regular season games with the NBA parent team.',
      'Ineligible for postseason rosters unless converted to a standard NBA contract by the final day of the regular season.',
      'Two-Way player salary has $0 cap hit and $0 luxury tax hit.',
    ],
  },
];
