import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const config = window.GGKN_AUTH_CONFIG || {};
let client;
let chosenRole = 'user';
const modal = document.querySelector('#authModal');
const message = document.querySelector('#authMessage');
const sendButton = document.querySelector('#sendOtp');
const verifyButton = document.querySelector('#verifyOtp');
const phoneField = document.querySelector('#authPhone');
const codeField = document.querySelector('#authCode');
const app = document.querySelector('.app');

function showMessage(text, kind = '') {
  message.textContent = text;
  message.className = `auth-message ${kind}`;
}

function supabase() {
  if (!config.supabaseUrl || !config.supabasePublishableKey) {
    throw new Error('Mobile sign-in is not configured yet. The site owner must connect Supabase Auth and an SMS provider.');
  }
  if (!client) client = createClient(config.supabaseUrl, config.supabasePublishableKey);
  return client;
}

function renderSession(user, role) {
  const closeButton = document.querySelector('#closeAuth');
  const logoutButton = document.querySelector('#logoutButton');
  const sessionLabel = document.querySelector('#sessionLabel');
  const profileName = document.querySelector('#profileName');
  const profileRole = document.querySelector('#profileRole');
  if (!user) {
    document.body.classList.add('auth-required');
    app.hidden = true;
    closeButton.hidden = true;
    logoutButton.hidden = true;
    sessionLabel.textContent = '';
    profileName.textContent = 'Gyan Guardian';
    profileRole.textContent = 'Sign-in required';
    if (!modal.open) modal.showModal();
    return;
  }
  document.body.classList.remove('auth-required');
  app.hidden = false;
  closeButton.hidden = true;
  logoutButton.hidden = false;
  const isAdmin = role === 'admin';
  sessionLabel.textContent = isAdmin ? 'Administrator access' : 'Learner access';
  profileName.textContent = 'NCA';
  profileRole.textContent = isAdmin ? 'Admin' : 'Learner';
  if (modal.open) modal.close();
}

document.querySelector('#closeAuth').addEventListener('click', () => {
  if (!document.body.classList.contains('auth-required')) modal.close();
});
modal.addEventListener('cancel', event => {
  if (document.body.classList.contains('auth-required')) event.preventDefault();
});
modal.addEventListener('click', event => {
  if (event.target === modal && document.body.classList.contains('auth-required')) event.preventDefault();
});

document.querySelectorAll('[data-role]').forEach(button => button.addEventListener('click', () => {
  chosenRole = button.dataset.role;
  document.querySelectorAll('[data-role]').forEach(option => option.classList.toggle('active', option === button));
  showMessage(chosenRole === 'admin'
    ? 'Administrator sign-in is restricted to phone numbers approved by the site owner.'
    : 'Learners can sign in or create an account with a verified mobile number.');
}));

sendButton.addEventListener('click', async () => {
  const phone = phoneField.value.trim();
  if (!/^\+[1-9]\d{7,14}$/.test(phone)) return showMessage('Enter your number with country code, for example +14155550123.', 'error');
  sendButton.disabled = true;
  try {
    const { error } = await supabase().auth.signInWithOtp({ phone, options: { shouldCreateUser: true } });
    if (error) throw error;
    codeField.value = '';
    document.querySelector('#otpStep').hidden = false;
    showMessage('A verification code was sent by SMS. Enter it below to continue.', 'success');
    codeField.focus();
  } catch (error) {
    const detail = error.message || '';
    const messageText = /signups not allowed for otp/i.test(detail)
      ? 'Phone OTP signup is disabled in Supabase. Enable the Phone provider and configure its SMS provider.'
      : detail || 'Could not send the code. Check the number and try again.';
    showMessage(messageText, 'error');
  }
  finally { sendButton.disabled = false; }
});

verifyButton.addEventListener('click', async () => {
  const phone = phoneField.value.trim();
  const token = codeField.value.trim();
  if (!/^\d{6}$/.test(token)) return showMessage('Enter the 6-digit code from your SMS.', 'error');
  verifyButton.disabled = true;
  try {
    const auth = supabase();
    const { data, error } = await auth.auth.verifyOtp({ phone, token, type: 'sms' });
    if (error) throw error;
    const user = data.user;
    const { data: roleRow, error: roleError } = await auth.from('user_roles').select('role').eq('user_id', user.id).maybeSingle();
    if (roleError) throw roleError;
    const actualRole = roleRow?.role || 'user';
    if (chosenRole === 'admin' && actualRole !== 'admin') {
      await auth.auth.signOut();
      throw new Error('This phone number is not approved for administrator access.');
    }
    showMessage(`Signed in as ${actualRole === 'admin' ? 'administrator' : 'learner'}.`, 'success');
    renderSession(user, actualRole);
  } catch (error) { showMessage(error.message || 'The code could not be verified. Request a new one and try again.', 'error'); }
  finally { verifyButton.disabled = false; }
});

document.querySelector('#logoutButton').addEventListener('click', async () => {
  try {
    const { error } = await supabase().auth.signOut();
    if (error) throw error;
    renderSession(null);
    showMessage('You are signed out. Choose an access type and verify your mobile number to continue.');
  } catch (error) { showMessage(error.message || 'Could not sign out.', 'error'); }
});

async function loadSession() {
  if (!config.supabaseUrl || !config.supabasePublishableKey) {
    renderSession(null);
    showMessage('Mobile sign-in is awaiting Supabase and SMS provider setup.');
    return;
  }
  try {
    const auth = supabase();
    const { data: { session }, error } = await auth.auth.getSession();
    if (error) throw error;
    if (!session) return renderSession(null);
    const { data, error: roleError } = await auth.from('user_roles').select('role').eq('user_id', session.user.id).maybeSingle();
    if (roleError) throw roleError;
    renderSession(session.user, data?.role || 'user');
  } catch (error) {
    renderSession(null);
    showMessage(error.message || 'Sign-in could not be checked. Please try again.', 'error');
  }
}

loadSession();

