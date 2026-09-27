import profile from '../data/profile';

const emit = (name, detail) => window.dispatchEvent(new CustomEvent(name, { detail }));

export function toast(message) {
  emit('app:toast', message);
}

export function scrollToSection(id) {
  const el = document.getElementById(id);
  if (!el) return;
  el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  el.classList.remove('flash');
  void el.offsetWidth;
  el.classList.add('flash');
}

export function getTheme() {
  return document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light';
}

export function setTheme(theme) {
  document.documentElement.dataset.theme = theme;
  try {
    localStorage.setItem('theme', theme);
  } catch {}
  emit('app:theme', theme);
}

export function toggleTheme() {
  const next = getTheme() === 'dark' ? 'light' : 'dark';
  setTheme(next);
  return next;
}

export async function copyEmail() {
  try {
    await navigator.clipboard.writeText(profile.email);
    toast(`Copied ${profile.email}`);
    return true;
  } catch {
    toast(profile.email);
    return false;
  }
}

export function openResume() {
  window.open(profile.resumeUrl, '_blank', 'noopener');
}

export function openUrl(url) {
  window.open(url, '_blank', 'noopener');
}

export function fireEgg(name) {
  emit('app:egg', name);
}

export function openPalette() {
  emit('app:palette');
}

export const mailtoPresets = {
  hiring: { label: 'Hiring', subject: `Opportunity for ${profile.name}`, body: `Hi ${profile.name.split(' ')[0]},\n\nI came across your portfolio and would like to talk about a role:\n\n- Company:\n- Role:\n- Location / remote:\n\nThanks!` },
  collab: { label: 'Collaboration', subject: 'Let’s build something together', body: `Hi ${profile.name.split(' ')[0]},\n\nI have an idea I think you’d be great for:\n\n` },
  hello: { label: 'Just saying hi', subject: 'Hello from your portfolio', body: `Hi ${profile.name.split(' ')[0]},\n\n` },
};

export function mailtoFor(key) {
  const p = mailtoPresets[key] || mailtoPresets.hello;
  return `mailto:${profile.email}?subject=${encodeURIComponent(p.subject)}&body=${encodeURIComponent(p.body)}`;
}
