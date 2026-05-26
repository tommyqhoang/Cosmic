import type { Metadata } from 'next'
import LegalDoc, { type LegalSection } from '@/components/legal/LegalDoc'

const UPDATED = 'May 25, 2026'

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description:
    'The Privacy Policy for ShinyMS — what data we collect, how we use it, the third-party services we rely on, and how to request deletion.',
  alternates: { canonical: 'https://shinyms.com/privacy' },
  openGraph: {
    url: 'https://shinyms.com/privacy',
    title: 'Privacy Policy | ShinyMS',
    description: 'What data ShinyMS collects, how it is used, and your rights.',
  },
}

const SECTIONS: LegalSection[] = [
  {
    heading: 'Introduction',
    paragraphs: [
      'This Privacy Policy explains what information ShinyMS (the "Service", "we", "us", or "our") collects, how we use it, and the choices you have. ShinyMS is a free, fan-made, non-commercial MapleStory v83 private server. We collect the minimum data needed to run the game and keep it fair.',
    ],
  },
  {
    heading: 'Information We Collect',
    paragraphs: ['We collect only what is necessary to operate your account and the Service:'],
    bullets: [
      'Account details: your username, a securely hashed password (we never store your password in plain text), and your email address (required at registration).',
      'Date of birth: collected at registration to confirm age eligibility.',
      'Technical data: your IP address and basic request metadata, used for rate limiting, abuse prevention, and security.',
      'Gameplay data: characters, levels, items, guild membership, and other in-game progress generated as you play.',
      'Newsletter subscription: if you opt in to announcement emails from our homepage, we store your email address (lower-cased) so we can send you updates.',
      'Communications: messages you send to staff (for example, support requests via Discord).',
    ],
  },
  {
    heading: 'How We Use Your Information',
    bullets: [
      'To create and maintain your account and game progress.',
      'To operate, secure, and improve the Service.',
      'To prevent fraud, cheating, ban evasion, and other abuse.',
      'To verify age eligibility and enforce our Terms of Service.',
      'To respond to your support requests.',
      'To contact you about your account — including security notices, account recovery, and important changes to the Service.',
      'To send announcement emails (server news, events, and updates) if you have subscribed to our newsletter. Every such email includes a one-click unsubscribe link.',
    ],
  },
  {
    heading: 'Cookies & Sessions',
    paragraphs: [
      'We use a strictly necessary session cookie to keep you signed in to the website after you log in. This cookie is essential to the authentication feature and is not used for advertising or cross-site tracking.',
    ],
  },
  {
    heading: 'Third-Party Services',
    paragraphs: ['We rely on a small number of third-party providers to run the Service. These providers may process limited data (such as your IP address) on our behalf:'],
    bullets: [
      'Cloudflare Turnstile — a privacy-friendly CAPTCHA used during account creation to block automated sign-ups. It may process your IP address and browser signals to verify you are human.',
      'Resend — our email delivery provider. It processes your email address to send account-related and newsletter emails on our behalf.',
      'Hosting providers — used to host the website, game server, and database.',
      'Discord — our community and support platform, governed by Discord’s own privacy policy.',
    ],
  },
  {
    heading: 'How We Share Information',
    paragraphs: [
      'We do not sell, rent, or trade your personal information. We share data only with the service providers listed above as needed to operate the Service, or when required to comply with a valid legal request or to protect the safety and rights of our players and staff.',
      'Note that some information is public by design: in-game character names, levels, classes, guild names, and ranking positions are visible to other players and on this website.',
    ],
  },
  {
    heading: 'Data Retention',
    paragraphs: [
      'We retain account and gameplay data for as long as your account exists and as needed to operate the Service. Technical logs used for security are kept only for a limited period. If your account is deleted, associated personal data is removed or anonymized, except where retention is required for legitimate security or legal reasons.',
    ],
  },
  {
    heading: 'Data Security',
    paragraphs: [
      'Passwords are stored using industry-standard one-way hashing (bcrypt). We take reasonable measures to protect your data, but no online service can be guaranteed to be perfectly secure. You are responsible for keeping your credentials safe.',
    ],
  },
  {
    heading: 'Children’s Privacy',
    paragraphs: [
      'The Service is not directed to children under 13, and we do not knowingly collect personal data from them. If you believe a child under 13 has provided us with personal information, contact us via Discord and we will delete it.',
    ],
  },
  {
    heading: 'Your Rights & Choices',
    paragraphs: [
      'You may request access to, correction of, or deletion of your personal data by contacting the ShinyMS team through our official Discord. A valid email address is required at registration and is used for account recovery and important account notices; you may ask us to update it at any time.',
      'Newsletter emails are optional: you can subscribe or unsubscribe at any time using the one-click link at the bottom of every announcement email, without affecting your account.',
    ],
  },
  {
    heading: 'Changes to This Policy',
    paragraphs: [
      'We may update this Privacy Policy from time to time. Material changes will be announced through the website or our Discord, and the "Last updated" date above will be revised.',
    ],
  },
  {
    heading: 'Contact',
    paragraphs: [
      'For any privacy questions or requests, use our contact page at /contact or reach the ShinyMS team through our official Discord server, linked in the site footer.',
    ],
  },
]

export default function PrivacyPage() {
  return (
    <LegalDoc
      title="Privacy Policy"
      updated={UPDATED}
      intro="Your privacy matters to us. This policy describes the limited data ShinyMS collects, how it is used, and how you can exercise your rights."
      sections={SECTIONS}
    />
  )
}
