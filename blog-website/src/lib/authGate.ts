const GATE_PASSWORD_KEY = "quirex_gate_password";
const GATE_UNLOCKED_KEY = "quirex_gate_unlocked";

/** Admin sets this password for protected docs */
export function setGatePassword(password: string) {
  localStorage.setItem(GATE_PASSWORD_KEY, password);
}

export function getGatePassword(): string {
  return localStorage.getItem(GATE_PASSWORD_KEY) || "";
}

export function hasGatePassword(): boolean {
  return !!localStorage.getItem(GATE_PASSWORD_KEY);
}

/** Checks if the user has unlocked protected content this session */
export function isGateUnlocked(): boolean {
  return sessionStorage.getItem(GATE_UNLOCKED_KEY) === "true";
}

export function unlockGate(password: string): boolean {
  const stored = getGatePassword();
  if (!stored) return true; // no password set = always unlocked
  if (password === stored) {
    sessionStorage.setItem(GATE_UNLOCKED_KEY, "true");
    return true;
  }
  return false;
}

export function lockGate() {
  sessionStorage.removeItem(GATE_UNLOCKED_KEY);
}
