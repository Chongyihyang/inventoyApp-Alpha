import { LocalStorage } from "./storage.svelte";

export const department = new LocalStorage("department", { value: 0 });

export const toLog = new LocalStorage("logging", { value: 0})