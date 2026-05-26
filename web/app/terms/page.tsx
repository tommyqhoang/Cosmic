import type { Metadata } from 'next'
import LegalDoc, { type LegalSection } from '@/components/legal/LegalDoc'

const UPDATED = 'May 25, 2026'

export const metadata: Metadata = {
  title: 'Terms of Service',
  description:
    'The Terms of Service for ShinyMS — a free, fan-made MapleStory v83 private server. Read the rules of conduct, account terms, and disclaimers before playing.',
  alternates: { canonical: 'https://shinyms.com/terms' },
  openGraph: {
    url: 'https://shinyms.com/terms',
    title: 'Terms of Service | ShinyMS',
    description: 'Rules of conduct, account terms, and disclaimers for ShinyMS.',
  },
}

const SECTIONS: LegalSection[] = [
  {
    heading: 'Acceptance of Terms',
    paragraphs: [
      'By creating an account, accessing, or playing on ShinyMS (the "Service"), you agree to be bound by these Terms of Service ("Terms") and our Privacy Policy. If you do not agree with any part of these Terms, you must not register for or use the Service.',
      'These Terms form a binding agreement between you and the volunteer team that operates ShinyMS (the "Server", "we", "us", or "our").',
    ],
  },
  {
    heading: 'Eligibility',
    paragraphs: [
      'You must be at least 13 years old to create an account. If you are under the age of majority in your jurisdiction, you confirm that a parent or legal guardian has reviewed and agreed to these Terms on your behalf.',
      'By registering, you confirm that the information you provide is accurate and that you are legally permitted to use the Service in your location.',
    ],
  },
  {
    heading: 'Description of the Service',
    paragraphs: [
      'ShinyMS is a free, non-commercial, fan-made private server emulating the MapleStory v83 client for nostalgic and educational purposes. It is operated on a hobbyist basis with no guarantee of availability, performance, or data persistence.',
      'ShinyMS is not affiliated with, endorsed by, sponsored by, or associated with NEXON Co., Ltd. or Wizet. MapleStory and all related characters, names, and assets are trademarks and copyrights of their respective owners.',
    ],
  },
  {
    heading: 'Account Registration & Security',
    paragraphs: [
      'You are responsible for maintaining the confidentiality of your account credentials and for all activity that occurs under your account.',
    ],
    bullets: [
      'You must provide a valid email address at registration. We use it for account recovery and important account or service notices, as described in our Privacy Policy.',
      'You may not share, sell, trade, or transfer your account to any other person.',
      'You must notify us promptly (via our Discord) if you believe your account has been compromised.',
      'We are not liable for any loss arising from unauthorized use of your account.',
      'One person may not operate accounts to gain an unfair advantage where this is prohibited by in-game rules.',
    ],
  },
  {
    heading: 'Code of Conduct & Acceptable Use',
    paragraphs: ['To keep ShinyMS fair and enjoyable for everyone, you agree NOT to:'],
    bullets: [
      'Use bots, macros, automation, third-party hacks, memory editors, packet editors, or any tool that provides an unfair advantage.',
      'Exploit bugs, glitches, or duplication methods instead of reporting them to staff.',
      'Engage in real-money trading (RMT) — buying, selling, or trading in-game items, mesos, accounts, or services for real-world currency or goods.',
      'Harass, threaten, impersonate, defame, or discriminate against other players or staff.',
      'Post spam, advertising, sexually explicit content, or content that is illegal in your jurisdiction.',
      'Attempt to disrupt, overload, attack, gain unauthorized access to, or reverse-engineer the Service or its infrastructure.',
      'Evade bans, mutes, or other moderation actions through alternate accounts.',
    ],
  },
  {
    heading: 'Virtual Items Have No Real-World Value',
    paragraphs: [
      'All in-game content — including characters, items, mesos, NX, levels, and any other virtual goods — is licensed to you for personal, non-commercial entertainment only. You do not own these items.',
      'Virtual items have no monetary value, cannot be redeemed for cash, and may be modified, reset, or removed at any time, including during server wipes, maintenance, or rule enforcement, without compensation.',
    ],
  },
  {
    heading: 'Donations',
    paragraphs: [
      'ShinyMS is free to play and is not pay-to-win. If voluntary donations are ever accepted, they are gifts to help cover hosting costs and do not entitle you to any product, service, in-game advantage, or refund. Donations are non-refundable to the fullest extent permitted by law.',
    ],
  },
  {
    heading: 'Communications',
    paragraphs: [
      'By creating an account you agree that we may send you essential account and service emails, such as security notices and account-recovery messages.',
      'Announcement emails (server news, events, and updates) are optional. You can subscribe from our homepage and unsubscribe at any time using the one-click link in any such email, without affecting your account.',
    ],
  },
  {
    heading: 'Intellectual Property',
    paragraphs: [
      'MapleStory, its artwork, music, characters, and game data are the intellectual property of NEXON Co., Ltd. and Wizet. ShinyMS claims no ownership over these assets and uses them solely for non-commercial, nostalgic purposes.',
      'Any original code, tools, website content, or custom assets created by the ShinyMS team remain the property of their respective authors. We will comply with valid takedown requests from rights holders.',
    ],
  },
  {
    heading: 'Service Provided "As Is"',
    paragraphs: [
      'The Service is provided "as is" and "as available" without warranties of any kind, whether express or implied, including but not limited to fitness for a particular purpose, uninterrupted availability, or data preservation.',
      'We do not guarantee that the Service will be secure, error-free, or continuously available, and we may modify, suspend, or discontinue any part of it at any time without notice.',
    ],
  },
  {
    heading: 'Limitation of Liability',
    paragraphs: [
      'To the maximum extent permitted by law, the ShinyMS team shall not be liable for any indirect, incidental, special, consequential, or punitive damages, or for any loss of data, progress, virtual items, or goodwill arising from your use of, or inability to use, the Service.',
    ],
  },
  {
    heading: 'Suspension & Termination',
    paragraphs: [
      'We may suspend, restrict, ban, or delete any account at our sole discretion, with or without notice, for any reason — including violation of these Terms, cheating, or conduct that harms the community.',
      'You may stop using the Service at any time and may request account deletion as described in our Privacy Policy.',
    ],
  },
  {
    heading: 'Changes to These Terms',
    paragraphs: [
      'We may update these Terms from time to time. Material changes will be announced through the website or our Discord. Your continued use of the Service after changes take effect constitutes acceptance of the revised Terms.',
    ],
  },
  {
    heading: 'Contact',
    paragraphs: [
      'Questions about these Terms can be directed to the ShinyMS team via our contact page at /contact or through our official Discord server, linked in the site footer.',
    ],
  },
]

export default function TermsPage() {
  return (
    <LegalDoc
      title="Terms of Service"
      updated={UPDATED}
      intro="Please read these Terms carefully. They govern your access to and use of ShinyMS. By registering an account you confirm that you have read, understood, and agree to be bound by them."
      sections={SECTIONS}
    />
  )
}
