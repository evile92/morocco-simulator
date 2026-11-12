import { GameState } from '../types/game';
import { evaluateStrategicGoals } from '../simulation/engine';
import moroccoApiData from '../data/moroccoApiData.json';

const STORAGE_PREFIX = 'morocco_simulator_save_';

/**
 * Hydrates loaded or imported saves with safe defaults for fields introduced in newer versions.
 */
export function hydrateGameState(raw: unknown): GameState {
  const state = raw as GameState;
  const syncedDams = Array.isArray(state.water?.dams) && state.water.dams.length > 0
    ? state.water.dams
    : (moroccoApiData.dams?.dams || []);

  const appliedDesalinationPolicyIds = Array.isArray(state.water?.appliedDesalinationPolicyIds)
    ? state.water.appliedDesalinationPolicyIds
    : (state.policies || [])
        .filter(p => p.implemented && (p.modifiers?.desalinationDelta || 0) > 0)
        .map(p => p.id);

  const goals =
    Array.isArray(state.goals) && state.goals.length > 0
      ? state.goals
      : state.water && state.budget && state.economy && state.government
      ? evaluateStrategicGoals(state)
      : [];

  return {
    ...state,
    actionCooldowns: state.actionCooldowns ?? {},
    executedOneTimeActions: state.executedOneTimeActions ?? [],
    goals,
    gameOver: state.gameOver ?? null,
    water: {
      ...state.water,
      appliedDesalinationPolicyIds,
      dams: syncedDams
    }
  };
}

export interface SaveSlotMetadata {
  slotId: string;
  name: string;
  savedAt: string;
  gameDate: string;
  primeMinister: string;
  approval: number;
  stability: number;
  isEmpty: boolean;
}

export function getSaveSlotKeys(): string[] {
  return ['slot_1', 'slot_2', 'slot_3', 'slot_4', 'autosave'];
}

export function listSaveSlots(): SaveSlotMetadata[] {
  const slots: SaveSlotMetadata[] = [];
  const keys = getSaveSlotKeys();

  for (const key of keys) {
    const raw = localStorage.getItem(STORAGE_PREFIX + key);
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        slots.push({
          slotId: key,
          name: key === 'autosave' ? 'Auto-Save' : `Slot ${key.replace('slot_', '')}`,
          savedAt: parsed._savedAt || 'Unknown',
          gameDate: `${parsed.currentMonth}/${parsed.currentYear}`,
          primeMinister: parsed.government?.primeMinister || 'N/A',
          approval: parsed.government?.approvalRating || 0,
          stability: parsed.government?.stability || 0,
          isEmpty: false
        });
      } catch {
        slots.push({
          slotId: key,
          name: key === 'autosave' ? 'Auto-Save' : `Slot ${key.replace('slot_', '')}`,
          savedAt: '',
          gameDate: '',
          primeMinister: '',
          approval: 0,
          stability: 0,
          isEmpty: true
        });
      }
    } else {
      slots.push({
        slotId: key,
        name: key === 'autosave' ? 'Auto-Save' : `Slot ${key.replace('slot_', '')}`,
        savedAt: '',
        gameDate: '',
        primeMinister: '',
        approval: 0,
        stability: 0,
        isEmpty: true
      });
    }
  }

  return slots;
}

export function saveGameState(slotId: string, state: GameState): boolean {
  try {
    const payload = {
      ...state,
      _savedAt: new Date().toLocaleString()
    };
    localStorage.setItem(STORAGE_PREFIX + slotId, JSON.stringify(payload));
    return true;
  } catch (err) {
    console.error('Failed to save game state to slot:', slotId, err);
    return false;
  }
}

export function loadGameState(slotId: string): GameState | null {
  try {
    const raw = localStorage.getItem(STORAGE_PREFIX + slotId);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    delete parsed._savedAt;
    return hydrateGameState(parsed);
  } catch (err) {
    console.error('Failed to load game state from slot:', slotId, err);
    return null;
  }
}

export function exportSaveFile(state: GameState): void {
  const jsonStr = JSON.stringify(state, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `morocco_sim_${state.currentYear}_m${state.currentMonth}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

export function importSaveFile(file: File): Promise<GameState> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        const parsed = JSON.parse(text);
        if (!parsed.currentYear || !parsed.government) {
          throw new Error('Invalid save file structure');
        }
        resolve(hydrateGameState(parsed));
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsText(file);
  });
}
