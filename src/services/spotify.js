const CLIENT_ID = 'bf4a1ce68e4b41428350e79b78eb1d6a';
const REDIRECT_URI = window.location.origin + '/callback';
const SCOPES = ['user-read-private'];

async function generateCodeChallenge(verifier) {
  const data = new TextEncoder().encode(verifier);
  const digest = await crypto.subtle.digest('SHA-256', data);
  return btoa(String.fromCharCode(...new Uint8Array(digest)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

function generateCodeVerifier(length = 64) {
  const possible =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~';
  const arr = new Uint8Array(length);
  crypto.getRandomValues(arr);
  return Array.from(arr)
    .map((x) => possible[x % possible.length])
    .join('');
}

export async function loginWithSpotify() {
  const verifier = generateCodeVerifier();
  const challenge = await generateCodeChallenge(verifier);
  localStorage.setItem('spotify_verifier', verifier);
  const params = new URLSearchParams({
    client_id: CLIENT_ID,
    response_type: 'code',
    redirect_uri: REDIRECT_URI,
    scope: SCOPES.join(' '),
    code_challenge_method: 'S256',
    code_challenge: challenge,
  });
  window.location.href = `https://accounts.spotify.com/authorize?${params}`;
}

export async function exchangeCodeForToken(code) {
  const verifier = localStorage.getItem('spotify_verifier');
  const body = new URLSearchParams({
    grant_type: 'authorization_code',
    code,
    redirect_uri: REDIRECT_URI,
    client_id: CLIENT_ID,
    code_verifier: verifier,
  });
  const res = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body,
  });
  const data = await res.json();
  if (data.access_token) {
    localStorage.setItem('spotify_token', data.access_token);
    localStorage.setItem(
      'spotify_token_expiry',
      Date.now() + data.expires_in * 1000
    );
    if (data.refresh_token)
      localStorage.setItem('spotify_refresh_token', data.refresh_token);
    return data.access_token;
  }
  throw new Error('Token exchange failed');
}

export async function getToken() {
  const expiry = parseInt(localStorage.getItem('spotify_token_expiry') || '0');
  if (Date.now() < expiry - 30000) return localStorage.getItem('spotify_token');
  const refresh = localStorage.getItem('spotify_refresh_token');
  if (!refresh) return null;
  const body = new URLSearchParams({
    grant_type: 'refresh_token',
    refresh_token: refresh,
    client_id: CLIENT_ID,
  });
  const res = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body,
  });
  const data = await res.json();
  if (data.access_token) {
    localStorage.setItem('spotify_token', data.access_token);
    localStorage.setItem(
      'spotify_token_expiry',
      Date.now() + data.expires_in * 1000
    );
    return data.access_token;
  }
  return null;
}

export function isLoggedInSpotify() {
  return !!localStorage.getItem('spotify_token');
}
