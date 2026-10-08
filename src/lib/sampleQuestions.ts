import { Question, Subject, BUILTIN_SUBJECTS } from './types';

export const INITIAL_SUBJECTS: Subject[] = BUILTIN_SUBJECTS.map((s, idx) => ({
  id: `sub-builtin-${idx + 1}`,
  user_id: null,
  name: s.name,
  code: s.code,
  created_at: new Date().toISOString(),
}));

export const SAMPLE_QUESTIONS: Omit<Question, 'user_id'>[] = [
  {
    id: 'q-demo-1',
    subject_id: 'sub-builtin-1', // Economy
    topic: 'Fiscal Policy',
    question_text: `With reference to the Indian economy, consider the following statements:
1. Expansionary fiscal policy leads to an increase in government expenditure and reduction in tax rates.
2. It is typically employed during economic recessions to stimulate aggregate demand.
3. It always reduces the fiscal deficit of the central government.

Which of the statements given above is/are correct?`,
    options: [
      '1 and 2 only',
      '2 and 3 only',
      '1 and 3 only',
      '1, 2 and 3',
    ],
    correct_index: 0,
    explanation: `Statement 1 and 2 are correct: Expansionary fiscal policy involves boosting government spending and cutting taxes to boost aggregate demand during recessions.
Statement 3 is incorrect: Expansionary fiscal policy increases government spending and cuts revenues, which typically INCREASES the fiscal deficit, rather than reducing it.`,
    tags: ['Economy', 'Fiscal Deficit', 'Prelims 2024'],
    source: 'UPSC CSE Prelims Mock',
    source_date: '2025-01-15',
    priority: 1,
    difficulty: 2,
    deleted_at: null,
  },
  {
    id: 'q-demo-2',
    subject_id: 'sub-builtin-9', // Polity
    topic: 'Constitutional Bodies',
    question_text: `Consider the following statements regarding the Election Commission of India (ECI):
1. The Chief Election Commissioner and Election Commissioners enjoy equal powers and draw equal salaries.
2. In case of difference of opinion among the Chief Election Commissioner and other Election Commissioners, the matter is decided by the Chief Election Commissioner unilaterally.
3. The Constitution has not specified the qualifications of the members of the Election Commission.

Which of the statements given above is/are correct?`,
    options: [
      '1 and 2 only',
      '1 and 3 only',
      '2 and 3 only',
      '1, 2 and 3',
    ],
    correct_index: 1,
    explanation: `Statement 1 is correct: The Chief Election Commissioner (CEC) and the two other Election Commissioners have equal powers and receive equal salary and allowances.
Statement 2 is incorrect: In case of difference of opinion, the matter is decided by the Commission by majority, NOT unilaterally by the CEC.
Statement 3 is correct: The Constitution has not prescribed qualifications (legal, educational, administrative) for the members of the Election Commission.`,
    tags: ['Polity', 'ECI', 'Constitutional Bodies'],
    source: 'Laxmikanth Polity Revision',
    source_date: '2025-02-10',
    priority: 1,
    difficulty: 2,
    deleted_at: null,
  },
  {
    id: 'q-demo-3',
    subject_id: 'sub-builtin-2', // Current Affairs
    topic: 'Digital Public Infrastructure',
    question_text: `With reference to India's Unified Payments Interface (UPI) internationalization in 2025-2026, consider the following statements:
1. NPCI International Payments Limited (NIPL) has linked UPI with Singapore's PayNow and UAE's AANI system.
2. UPI transactions can now be executed seamlessly by non-resident Indians using international mobile numbers linked to NRE/NRO accounts in select countries.

Which of the statements given above is/are correct?`,
    options: [
      '1 only',
      '2 only',
      'Both 1 and 2',
      'Neither 1 nor 2',
    ],
    correct_index: 2,
    explanation: `Both statements 1 and 2 are correct. India's NPCI International (NIPL) has successfully integrated UPI with cross-border real-time payment networks including Singapore (PayNow), UAE (AANI/Jaywan), and Mauritius. Furthermore, NRIs from over 10 countries can use local international phone numbers linked to NRE/NRO bank accounts to make UPI payments.`,
    tags: ['Current Affairs', 'UPI', 'Economy 2026'],
    source: 'PIB Release / Hindu',
    source_date: '2026-01-20',
    priority: 1,
    difficulty: 1,
    deleted_at: null,
  },
  {
    id: 'q-demo-4',
    subject_id: 'sub-builtin-7', // Environment
    topic: 'Ramsar Sites & Wetlands',
    question_text: `Consider the following pairs of Wetlands and their corresponding States in India:
1. Bhoj Wetland — Madhya Pradesh
2. Renuka Lake — Himachal Pradesh
3. Deepor Beel — Assam
4. Rudrasagar Lake — Tripura

How many of the pairs given above are correctly matched?`,
    options: [
      'Only one pair',
      'Only two pairs',
      'Only three pairs',
      'All four pairs',
    ],
    correct_index: 3,
    explanation: `All four pairs are correctly matched Ramsar sites:
- Bhoj Wetland: Madhya Pradesh
- Renuka Lake: Himachal Pradesh (smallest Ramsar site in India)
- Deepor Beel: Assam
- Rudrasagar Lake: Tripura`,
    tags: ['Environment', 'Wetlands', 'Ramsar'],
    source: 'MoEFCC Annual Report',
    source_date: '2025-03-01',
    priority: 2,
    difficulty: 2,
    deleted_at: null,
  },
  {
    id: 'q-demo-5',
    subject_id: 'sub-builtin-3', // Modern History
    topic: 'Freedom Struggle',
    question_text: `Which of the following events occurred during the tenure of Viceroy Lord Irwin?
1. Signing of the Gandhi-Irwin Pact (1931)
2. Appointment of the Simon Commission (1927)
3. Launch of the Civil Disobedience Movement (1930)

Select the correct answer using the code given below:`,
    options: [
      '1 and 2 only',
      '2 and 3 only',
      '1 and 3 only',
      '1, 2 and 3',
    ],
    correct_index: 3,
    explanation: `Lord Irwin served as Viceroy of India from 1926 to 1931. All three events took place during his tenure:
1. Simon Commission appointed in 1927 (arrived in India 1928)
2. Civil Disobedience Movement launched in March 1930 with Dandi March
3. Gandhi-Irwin Pact signed on March 5, 1931.`,
    tags: ['Modern History', 'Viceroys', 'Modern India'],
    source: 'NCERT Class 12 History',
    source_date: '2025-01-05',
    priority: 2,
    difficulty: 2,
    deleted_at: null,
  }
];
