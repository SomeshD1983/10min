/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// --- TYPES ---
type Email = {
  id: number;
  from: string;
  subject: string;
  body: string;
  received: Date;
};

type AppState = {
  emailAddress: string | null;
  timeLeft: number; // in seconds
  timerId: any | null;
  emails: Email[];
  selectedEmail: Email | null;
  isPremiumModalOpen: boolean;
};

// --- STATE MANAGEMENT ---
const state: AppState = {
  emailAddress: null,
  timeLeft: 600, // 10 minutes
  timerId: null,
  emails: [],
  selectedEmail: null,
  isPremiumModalOpen: false,
};

const setState = (newState: Partial<AppState>) => {
  Object.assign(state, newState);
  render();
};

// --- CORE LOGIC ---
const generateRandomEmail = (): string => {
  const domains = ['web-mail.io', 'tempinbox.co', 'fastmail.run'];
  const randomString = Math.random().toString(36).substring(2, 12);
  const domain = domains[Math.floor(Math.random() * domains.length)];
  return `${randomString}@${domain}`;
};

const startTimer = () => {
  if (state.timerId) clearInterval(state.timerId);
  const timerId = setInterval(() => {
    if (state.timeLeft <= 0) {
      clearInterval(timerId);
      setState({ timerId: null });
    } else {
      setState({ timeLeft: state.timeLeft - 1 });
    }
  }, 1000);
  setState({ timerId });
};

const extendTimer = () => {
  if (state.timeLeft > 0) {
    setState({ timeLeft: state.timeLeft + 600 });
  }
};

const copyToClipboard = (text: string) => {
  navigator.clipboard.writeText(text).then(() => {
    const copyButton = document.getElementById('copy-button');
    if (copyButton) {
        const originalText = copyButton.innerHTML;
        copyButton.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg>
            Copied!`;
        setTimeout(() => {
            copyButton.innerHTML = originalText;
        }, 2000);
    }
  });
};

const simulateIncomingEmails = () => {
  // Simulate first email after 5 seconds
  setTimeout(() => addFakeEmail(1), 5000);
  // Simulate second email after 15 seconds
  setTimeout(() => addFakeEmail(2), 15000);
};

const addFakeEmail = (id: number) => {
    const subjects = ["Welcome to Temp Mail!", "Your Account Verification", "Project Update", "Weekly Newsletter"];
    const senders = ["support@example.com", "security@service.com", "jane.doe@workplace.com", "updates@blog.com"];
    
    const newEmail: Email = {
        id: id,
        from: senders[id-1] || "no-reply@system.com",
        subject: subjects[id-1] || `Important Message #${id}`,
        body: `This is a simulated email body for message #${id}.<br><br>In a real application, the full HTML content of the email would be displayed here.<br><br>Regards,<br>The Temp Mail System`,
        received: new Date(),
    };
    setState({ emails: [newEmail, ...state.emails] });
}


// --- UI COMPONENTS (as functions returning HTML strings) ---
const HeaderComponent = () => `
  <header class="header">
    <div class="logo">Temp Mail</div>
    <div class="email-display-container">
      <span class="email-address" aria-live="polite">${state.emailAddress || 'Generating...'}</span>
      <button id="copy-button" class="icon-button" aria-label="Copy email address" title="Copy email address">
         <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>
         Copy
      </button>
    </div>
    <div class="header-actions">
        <button id="upgrade-button" class="button-secondary">✨ Upgrade</button>
    </div>
  </header>
`;

const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
}

const InboxPanelComponent = () => `
    <div class="inbox-panel">
        <div class="inbox-header">
            <h2>Inbox</h2>
            <div class="timer" aria-label="Time left until email expires">
                ${state.timeLeft > 0 ? formatTime(state.timeLeft) : 'Expired'}
                <button id="extend-timer-button" class="icon-button" ${state.timeLeft <=0 ? 'disabled' : ''} aria-label="Extend timer by 10 minutes" title="Extend timer by 10 minutes">
                   <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2v4"/><path d="m16.2 7.8 2.9-2.9"/><path d="M18 12h4"/><path d="m16.2 16.2 2.9 2.9"/><path d="M12 18v4"/><path d="m7.8 16.2-2.9 2.9"/><path d="M6 12H2"/><path d="m7.8 7.8-2.9-2.9"/><circle cx="12" cy="12" r="4"/><path d="M12 8v4l2 2"/></svg>
                </button>
            </div>
        </div>
        <div class="email-list" role="list">
            ${
              state.emails.length === 0
                ? `<div class="empty-inbox"><p>Waiting for incoming emails...</p></div>`
                : state.emails
                    .map(
                      (email) => `
                <div class="email-item" role="listitem" tabindex="0" data-email-id="${email.id}">
                    <div class="email-item-sender">${email.from}</div>
                    <div class="email-item-subject">${email.subject}</div>
                    <div class="email-item-time">${email.received.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                </div>`
                    )
                    .join('')
            }
        </div>
    </div>
`;

const EmailViewComponent = () => {
    if (!state.selectedEmail) return '<div class="email-view-placeholder"><p>Select an email to read</p></div>';
    const { from, subject, body, received } = state.selectedEmail;
    return `
        <div class="email-view">
             <div class="email-view-header">
                <button id="back-to-inbox" class="icon-button">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 12H5"/><path d="m12 19-7-7 7-7"/></svg>
                    Back
                </button>
                <button id="forward-email" class="button-secondary">Forward</button>
             </div>
             <div class="email-content">
                <h2 class="email-subject">${subject}</h2>
                <div class="email-details">
                    <strong>From:</strong> ${from}<br>
                    <strong>Received:</strong> ${received.toLocaleString()}
                </div>
                <div class="email-body">${body}</div>
             </div>
        </div>
    `
};

const SidePanelComponent = () => `
    <aside class="side-panel">
        <div class="ads-placeholder">
            <!--
              Google AdSense Unit
              Replace this div with your AdSense code.
              Recommended size: 300x600
            -->
            <p>Advertisement</p>
        </div>
    </aside>
`;

const PremiumModalComponent = () => {
    if (!state.isPremiumModalOpen) return '';
    return `
    <div class="modal-overlay">
        <div class="modal-content" role="dialog" aria-modal="true" aria-labelledby="premium-modal-title">
            <h2 id="premium-modal-title">✨ Upgrade to Premium</h2>
            <p>Get a custom domain email address that lasts for 24 hours.</p>
            <ul>
                <li>✔️ Custom domain name</li>
                <li>✔️ 24-hour email validity</li>
                <li>✔️ Ad-free experience</li>
                <li>✔️ Priority support</li>
            </ul>
            <div class="modal-actions">
                <button id="close-modal-button" class="button-secondary">Maybe Later</button>
                <button id="stripe-checkout-button" class="button-primary">
                  Pay with Stripe
                </button>
            </div>
            <p class="modal-note">Note: Clicking 'Pay with Stripe' is a placeholder. A real implementation would redirect to Stripe Checkout.</p>
        </div>
    </div>
    `;
};

// --- RENDER & EVENT HANDLING ---
const render = () => {
  const root = document.getElementById('root');
  if (!root) return;

  const appHtml = `
    <div class="container">
      ${HeaderComponent()}
      <main class="main-content">
        <div class="content-wrapper">
          ${state.selectedEmail ? EmailViewComponent() : InboxPanelComponent()}
        </div>
        ${SidePanelComponent()}
      </main>
    </div>
    ${PremiumModalComponent()}
  `;

  root.innerHTML = appHtml;
  attachEventListeners();
};

const attachEventListeners = () => {
    // Header
    document.getElementById('copy-button')?.addEventListener('click', () => copyToClipboard(state.emailAddress || ''));
    document.getElementById('upgrade-button')?.addEventListener('click', () => setState({ isPremiumModalOpen: true }));

    // Inbox Panel
    document.getElementById('extend-timer-button')?.addEventListener('click', extendTimer);
    document.querySelectorAll('.email-item').forEach(item => {
        item.addEventListener('click', () => {
            const emailId = parseInt(item.getAttribute('data-email-id') || '0');
            const selectedEmail = state.emails.find(e => e.id === emailId);
            if (selectedEmail) setState({ selectedEmail });
        });
        item.addEventListener('keydown', (e: KeyboardEvent) => {
            if (e.key === 'Enter' || e.key === ' ') {
                const emailId = parseInt(item.getAttribute('data-email-id') || '0');
                const selectedEmail = state.emails.find(e => e.id === emailId);
                if (selectedEmail) setState({ selectedEmail });
            }
        });
    });

    // Email View
    document.getElementById('back-to-inbox')?.addEventListener('click', () => setState({ selectedEmail: null }));
    document.getElementById('forward-email')?.addEventListener('click', () => alert('Forwarding functionality requires a backend.'));

    // Premium Modal
    document.getElementById('close-modal-button')?.addEventListener('click', () => setState({ isPremiumModalOpen: false }));
    document.getElementById('stripe-checkout-button')?.addEventListener('click', () => alert('Redirecting to Stripe... (simulation)'));
    document.querySelector('.modal-overlay')?.addEventListener('click', (e) => {
        if (e.target === e.currentTarget) {
            setState({ isPremiumModalOpen: false });
        }
    });
};

// --- INITIALIZATION ---
const init = () => {
  setState({
    emailAddress: generateRandomEmail()
  });
  startTimer();
  simulateIncomingEmails();
};

// Start the app
init();
