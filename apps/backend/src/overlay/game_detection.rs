use std::collections::HashSet;

const KNOWN_GAME_EXECUTABLES: &[&str] = &[
    "cyberpunk2077.exe",
    "eldenring.exe",
    "fortnite.exe",
    "valorant.exe",
    "leagueoflegends.exe",
    "dota2.exe",
    "csgo.exe",
    "cs2.exe",
    "overwatch.exe",
    "apexlegends.exe",
    "rocketleague.exe",
    "minecraft.exe",
    "gta5.exe",
    "rdr2.exe",
    "witcher3.exe",
    "skyrim.exe",
    "starfield.exe",
    "diablo4.exe",
    "wow.exe",
    "ffxiv.exe",
    "destiny2.exe",
    "cod.exe",
    "battlefield.exe",
    "pubg.exe",
    "rainbowsix.exe",
    "warframe.exe",
    "factorio.exe",
    "satisfactory.exe",
];

pub struct GameDetector {
    known_games: HashSet<String>,
}

impl GameDetector {
    pub fn new() -> Self {
        let known_games = KNOWN_GAME_EXECUTABLES
            .iter()
            .map(|s| s.to_lowercase())
            .collect();
        Self { known_games }
    }

    pub fn detect_running_games(&self) -> Vec<String> {
        let mut games = Vec::new();
        if let Ok(processes) = self.enumerate_processes() {
            for proc_name in processes {
                let lower = proc_name.to_lowercase();
                if self.known_games.contains(&lower) {
                    games.push(proc_name);
                }
            }
        }
        games
    }

    pub fn is_any_game_running(&self) -> bool {
        if let Ok(processes) = self.enumerate_processes() {
            for proc_name in processes {
                if self.known_games.contains(&proc_name.to_lowercase()) {
                    return true;
                }
            }
        }
        false
    }

    fn enumerate_processes(&self) -> Result<Vec<String>, String> {
        let mut system = sysinfo::System::new();
        system.refresh_processes(sysinfo::ProcessesToUpdate::All, true);
        let processes: Vec<String> = system
            .processes()
            .iter()
            .filter_map(|(_, process)| process.name().to_str().map(|s| s.to_string()))
            .collect();
        Ok(processes)
    }

    pub fn add_custom_game(&mut self, exe_name: &str) {
        self.known_games.insert(exe_name.to_lowercase());
    }

    pub fn known_games(&self) -> Vec<&str> {
        KNOWN_GAME_EXECUTABLES.to_vec()
    }
}
