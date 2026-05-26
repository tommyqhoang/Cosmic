// Worlds & channels shown on the status page.
//
// The game server defines worlds in `config.yaml` (worlds:), but the web app runs
// on a different host and can't read that file at runtime — so this is the
// web-side source of truth. KEEP IT IN SYNC with config.yaml: one entry per world
// the server actually launches, with its channel count and flag.
//
// Status is coarse: channels are shown Online whenever the game is up (per-channel
// populations aren't reported to the web yet).

export type WorldFlag = 0 | 1 | 2 | 3 // 0 = none, 1 = event, 2 = new, 3 = hot

export type WorldDef = {
  id: number
  name: string
  channels: number
  flag: WorldFlag
}

export const WORLDS: WorldDef[] = [
  { id: 0, name: 'Scania', channels: 3, flag: 0 },
]

export const FLAG_LABEL: Record<WorldFlag, string | null> = {
  0: null,
  1: 'Event',
  2: 'New',
  3: 'Hot',
}
