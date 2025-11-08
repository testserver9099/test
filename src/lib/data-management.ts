import { Profile } from './profile-context';
import { LeaderboardEntry } from './leaderboard-context';

interface AppData {
  profiles: Profile[];
  leaderboard: LeaderboardEntry[];
  selectedProfileId: string | null;
  theme: string;
}

export function exportData(): void {
  const profiles = JSON.parse(localStorage.getItem('profiles') || '[]');
  const leaderboard = JSON.parse(localStorage.getItem('leaderboard') || '[]');
  const selectedProfileId = localStorage.getItem('selectedProfileId');
  const theme = localStorage.getItem('arcadeverse-theme') || 'dark';

  const data: AppData = {
    profiles,
    leaderboard,
    selectedProfileId,
    theme,
  };

  const jsonString = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonString], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `arcadecalc_data_${new Date().toISOString().split('T')[0]}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function importData(file: File): Promise<void> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const jsonString = event.target?.result as string;
        const data: AppData = JSON.parse(jsonString);

        if (data.profiles && Array.isArray(data.profiles)) {
          localStorage.setItem('profiles', JSON.stringify(data.profiles));
        }
        if (data.leaderboard && Array.isArray(data.leaderboard)) {
          localStorage.setItem('leaderboard', JSON.stringify(data.leaderboard));
        }
        if (data.selectedProfileId !== undefined) {
          localStorage.setItem('selectedProfileId', data.selectedProfileId || '');
        }
        if (data.theme) {
          localStorage.setItem('arcadeverse-theme', data.theme);
        }
        resolve();
      } catch (error) {
        console.error('Error importing data:', error);
        reject(new Error('Invalid data file.'));
      }
    };
    reader.onerror = (error) => {
      console.error('Error reading file:', error);
      reject(new Error('Failed to read file.'));
    };
    reader.readAsText(file);
  });
}
