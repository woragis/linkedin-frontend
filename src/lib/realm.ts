export type AppRealm = "live" | "volume";

const REALM_KEY = "linkedin:realm";

export function getRealm(): AppRealm {
  if (typeof window === "undefined") return "live";
  return localStorage.getItem(REALM_KEY) === "volume" ? "volume" : "live";
}

export function setRealm(realm: AppRealm): void {
  localStorage.setItem(REALM_KEY, realm);
}

export function realmHeaders(): Record<string, string> {
  return { "X-App-Realm": getRealm() };
}

export function realmLabel(realm: AppRealm): string {
  return realm === "volume" ? "Volume" : "Vivo";
}

export function realmDescription(realm: AppRealm): string {
  return realm === "volume"
    ? "Laboratório de grafo em escala"
    : "Rede social com vida e conversas";
}
