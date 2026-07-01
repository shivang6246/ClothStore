import React from 'react';
import { Link } from 'react-router-dom';

const s = {
  h2: { fontFamily: "'Cormorant Garamond',serif", fontSize: '1.3rem', fontWeight: 400, color: '#f0ede6', margin: '2.5rem 0 0.8rem', letterSpacing: 0.5 } as React.CSSProperties,
  p: { color: '#666', fontSize: '0.82rem', lineHeight: 2.1, margin: '0 0 1rem' } as React.CSSProperties,
  li: { color: '#666', fontSize: '0.82rem', lineHeight: 2.1, marginBottom: 4 } as React.CSSProperties,
};

function LegalLayout({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ minHeight: '100vh', background: '#080808', color: '#f0ede6', fontFamily: "'Montserrat',sans-serif" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@300;400&family=Montserrat:wght@300;400;500&display=swap');`}</style>
      <nav style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.5rem 6%', borderBottom: '0.5px solid #141414' }}>
        <Link to="/" style={{ textDecoration: 'none', color: '#f0ede6', fontFamily: "'Cormorant Garamond',serif", fontSize: '1.4rem', fontWeight: 300, letterSpacing: 12 }}>VOGUE</Link>
        <Link to="/" style={{ textDecoration: 'none', color: '#666', fontSize: '0.7rem', letterSpacing: '2px', textTransform: 'uppercase' }}>← Back to Store</Link>
      </nav>
      <div style={{ maxWidth: 760, margin: '0 auto', padding: '4rem 6% 6rem' }}>
        <p style={{ fontSize: '0.6rem', letterSpacing: '4px', textTransform: 'uppercase', color: '#c9a96e', marginBottom: 12 }}>Legal</p>
        <h1 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 'clamp(2rem, 4vw, 3rem)', fontWeight: 300, margin: '0 0 0.5rem' }}>{title}</h1>
        <p style={{ color: '#3a3a3a', fontSize: '0.65rem', letterSpacing: '1px', marginBottom: '3rem', paddingBottom: '2rem', borderBottom: '0.5px solid #141414' }}>
          Last updated: April 2026
        </p>
        {children}
        <div style={{ marginTop: '4rem', padding: '2rem', border: '0.5px solid #141414', borderRadius: 4, background: '#0a0a0a' }}>
          <p style={{ fontSize: '0.75rem', color: '#555', lineHeight: 2, margin: 0 }}>
            Questions? Contact us at{' '}
            <a href="mailto:care@vogue.in" style={{ color: '#c9a96e', textDecoration: 'none' }}>care@vogue.in</a>{' '}
            or call <span style={{ color: '#888' }}>+91 11 4567 8901</span>
          </p>
        </div>
      </div>
      <footer style={{ borderTop: '0.5px solid #141414', padding: '2rem 6%', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <div style={{ display: 'flex', gap: '2rem' }}>
          <Link to="/privacy-policy" style={{ fontSize: '0.6rem', color: '#333', letterSpacing: '1.5px', textDecoration: 'none' }}>Privacy Policy</Link>
          <Link to="/terms-of-use" style={{ fontSize: '0.6rem', color: '#333', letterSpacing: '1.5px', textDecoration: 'none' }}>Terms of Use</Link>
          <Link to="/returns" style={{ fontSize: '0.6rem', color: '#333', letterSpacing: '1.5px', textDecoration: 'none' }}>Returns & Care</Link>
        </div>
        <p style={{ fontSize: '0.55rem', letterSpacing: '2px', color: '#222', margin: 0 }}>© 2026 VOGUE INDIA.</p>
      </footer>
    </div>
  );
}

export function PrivacyPolicy() {
  return (
    <LegalLayout title="Privacy Policy">
      <p style={s.p}>VOGUE India ("we", "us", "our") is committed to protecting your personal information. This policy explains how we collect, use, and safeguard your data when you use our platform.</p>

      <h2 style={s.h2}>1. Information We Collect</h2>
      <p style={s.p}>We collect information you provide directly to us, including name, email address, billing and shipping address, and payment information. We also collect data about your browsing behaviour on our platform, device information, and order history.</p>

      <h2 style={s.h2}>2. How We Use Your Information</h2>
      <ul style={{ paddingLeft: '1.2rem', margin: '0 0 1rem' }}>
        {['Process and fulfil your orders', 'Send order confirmations and shipping updates', 'Personalise your shopping experience', 'Improve our website and services', 'Send promotional communications (with your consent)', 'Comply with legal obligations'].map(i => <li key={i} style={s.li}>{i}</li>)}
      </ul>

      <h2 style={s.h2}>3. Data Sharing</h2>
      <p style={s.p}>We do not sell your personal data. We share data only with trusted service providers who assist in order fulfilment, payment processing, and email delivery — all bound by confidentiality agreements.</p>

      <h2 style={s.h2}>4. Cookies</h2>
      <p style={s.p}>We use essential cookies to maintain your session and cart. Analytics cookies help us understand usage patterns. You can disable cookies in your browser settings, though this may affect site functionality.</p>

      <h2 style={s.h2}>5. Data Retention</h2>
      <p style={s.p}>We retain your personal data as long as your account is active or as required for legal and business purposes. You may request deletion of your data at any time by contacting care@vogue.in.</p>

      <h2 style={s.h2}>6. Your Rights</h2>
      <p style={s.p}>You have the right to access, correct, or delete your personal data. You may also withdraw marketing consent at any time. To exercise these rights, write to us at the address below.</p>

      <h2 style={s.h2}>7. Security</h2>
      <p style={s.p}>We use industry-standard encryption and security measures to protect your data. However, no method of transmission over the internet is 100% secure.</p>

      <h2 style={s.h2}>8. Contact</h2>
      <p style={s.p}>VOGUE India, 14 Connaught Place, New Delhi – 110001. Email: care@vogue.in</p>
    </LegalLayout>
  );
}

export function TermsOfUse() {
  return (
    <LegalLayout title="Terms of Use">
      <p style={s.p}>By accessing or using the VOGUE India platform, you agree to be bound by these Terms of Use. Please read them carefully before making a purchase.</p>

      <h2 style={s.h2}>1. Use of the Platform</h2>
      <p style={s.p}>You must be at least 18 years of age to use this platform. You agree to use the site only for lawful purposes and in a manner that does not infringe the rights of others.</p>

      <h2 style={s.h2}>2. Account Responsibility</h2>
      <p style={s.p}>You are responsible for maintaining the confidentiality of your account credentials. VOGUE India is not liable for any loss resulting from unauthorised use of your account.</p>

      <h2 style={s.h2}>3. Product Information</h2>
      <p style={s.p}>We make every effort to display product colours and textures accurately. However, due to screen variation, actual colours may differ slightly. Product descriptions are provided in good faith.</p>

      <h2 style={s.h2}>4. Pricing</h2>
      <p style={s.p}>All prices are in Indian Rupees (₹) and inclusive of applicable taxes unless stated otherwise. We reserve the right to change prices at any time without prior notice.</p>

      <h2 style={s.h2}>5. Intellectual Property</h2>
      <p style={s.p}>All content on this platform — including imagery, typography, copy, and design — is the property of VOGUE India and protected by applicable intellectual property laws. Reproduction without written consent is prohibited.</p>

      <h2 style={s.h2}>6. Limitation of Liability</h2>
      <p style={s.p}>VOGUE India shall not be liable for any indirect, incidental, or consequential damages arising from use of the platform or products purchased.</p>

      <h2 style={s.h2}>7. Governing Law</h2>
      <p style={s.p}>These terms are governed by the laws of India. Any disputes shall be subject to the exclusive jurisdiction of the courts of New Delhi.</p>

      <h2 style={s.h2}>8. Changes to Terms</h2>
      <p style={s.p}>We reserve the right to modify these terms at any time. Continued use of the platform after changes constitutes acceptance of the revised terms.</p>
    </LegalLayout>
  );
}

export function ReturnsAndCare() {
  return (
    <LegalLayout title="Returns & Care">
      <p style={s.p}>We stand behind the quality of every piece we sell. If you are not entirely satisfied, we will make it right.</p>

      <h2 style={s.h2}>Return Policy</h2>
      <p style={s.p}>You may return unused, unworn items in their original packaging within <strong style={{ color: '#f0ede6', fontWeight: 500 }}>14 days</strong> of delivery. Items must have all original tags attached.</p>

      <h2 style={s.h2}>How to Initiate a Return</h2>
      <ul style={{ paddingLeft: '1.2rem', margin: '0 0 1rem' }}>
        {['Email care@vogue.in with your order number and reason for return', 'Our team will respond within 24 hours with a prepaid return label', 'Package the item securely in its original box', 'Drop off at any authorised courier partner', 'Refund processed within 7 business days of receipt'].map((i, idx) => (
          <li key={idx} style={s.li}><span style={{ color: '#c9a96e', marginRight: 8, fontWeight: 600 }}>{idx + 1}.</span>{i}</li>
        ))}
      </ul>

      <h2 style={s.h2}>Non-Returnable Items</h2>
      <ul style={{ paddingLeft: '1.2rem', margin: '0 0 1rem' }}>
        {['Items worn, washed, or altered', 'Final sale items (marked at checkout)', 'Accessories including belts, ties, and pocket squares once opened', 'Custom or made-to-measure pieces'].map(i => <li key={i} style={s.li}>{i}</li>)}
      </ul>

      <h2 style={s.h2}>Refund Method</h2>
      <p style={s.p}>Refunds are issued to the original payment method. We do not currently offer store credit exchanges. Allow 5–7 banking days for the refund to appear after processing.</p>

      {/* Care guide */}
      <div style={{ margin: '2.5rem 0', padding: '2rem', border: '0.5px solid #1e1e1e', borderRadius: 4, background: '#0d0d0d' }}>
        <p style={{ fontSize: '0.6rem', letterSpacing: '4px', textTransform: 'uppercase', color: '#c9a96e', marginBottom: 16 }}>Garment Care Guide</p>
        {[
          { fabric: 'Wool & Cashmere', care: 'Dry clean only. Store folded, never hung. Brush with a garment brush after each wear.' },
          { fabric: 'Cotton & Linen', care: 'Machine wash cold, gentle cycle. Hang dry. Iron while slightly damp on low-medium heat.' },
          { fabric: 'Leather & Suede', care: 'Wipe with a damp cloth. Condition monthly with leather balm. Keep away from direct sunlight and heat.' },
          { fabric: 'Knitwear', care: 'Hand wash cold or dry clean. Lay flat to dry — never hang as this distorts the shape.' },
          { fabric: 'Denim', care: 'Wash inside out in cold water, infrequently. Air dry to maintain indigo depth and fabric integrity.' },
        ].map(g => (
          <div key={g.fabric} style={{ display: 'grid', gridTemplateColumns: '160px 1fr', gap: '1rem', marginBottom: 16, paddingBottom: 16, borderBottom: '0.5px solid #1a1a1a' }}>
            <span style={{ fontSize: '0.72rem', color: '#f0ede6', fontWeight: 500, letterSpacing: '0.5px' }}>{g.fabric}</span>
            <span style={{ fontSize: '0.75rem', color: '#666', lineHeight: 1.8 }}>{g.care}</span>
          </div>
        ))}
      </div>

      <h2 style={s.h2}>Damaged or Defective Items</h2>
      <p style={s.p}>If you receive a damaged or defective item, please email us within 48 hours of delivery with photographs. We will arrange a replacement or full refund at no cost to you.</p>
    </LegalLayout>
  );
}
