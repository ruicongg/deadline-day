export interface PlayerBasicInfo {
  id: number
  name: string
  age: number
  player_market_value_euro: number
  season_start_year: number
  team?: string
  position?: string
  nationality?: string
  image?: string
  league?: string
}

export interface PlayerDetailedStats {
  player: string
  versus: string
  basedOnMinutes: number
  scouting_period: string
  metrics: {
    [key: string]: {
      per90: number
      percentile: number
    }
  }
}

export interface MetricCategory {
  name: string
  metrics: string[]
}

// Categories for organizing the metrics
export const metricCategories: MetricCategory[] = [
  {
    name: "Attacking",
    metrics: [
      "Goals",
      "Non-Penalty Goals",
      "Assists",
      "Goals + Assists",
      "Shots Total",
      "Shots on Target",
      "Shots on Target %",
      "Goals/Shot",
      "Goals/Shot on Target",
      "xG: Expected Goals",
      "npxG: Non-Penalty xG",
      "npxG/Shot",
      "Goals - xG",
      "Non-Penalty Goals - npxG",
    ],
  },
  {
    name: "Passing",
    metrics: [
      "Passes Attempted",
      "Passes Completed",
      "Pass Completion %",
      "Progressive Passes",
      "Key Passes",
      "Passes into Final Third",
      "Passes into Penalty Area",
      "Crosses",
      "Crosses into Penalty Area",
      "Through Balls",
      "xA: Expected Assists",
      "xAG: Exp. Assisted Goals",
      "Progressive Passing Distance",
      "Total Passing Distance",
    ],
  },
  {
    name: "Possession",
    metrics: [
      "Touches",
      "Touches (Att 3rd)",
      "Touches (Att Pen)",
      "Touches (Mid 3rd)",
      "Touches (Def 3rd)",
      "Touches (Def Pen)",
      "Carries",
      "Progressive Carries",
      "Carries into Final Third",
      "Carries into Penalty Area",
      "Progressive Carrying Distance",
      "Total Carrying Distance",
      "Successful Take-Ons",
      "Successful Take-On %",
      "Take-Ons Attempted",
      "Times Tackled During Take-On",
      "Dispossessed",
      "Miscontrols",
    ],
  },
  {
    name: "Defending",
    metrics: [
      "Tackles",
      "Tackles Won",
      "Tackles (Def 3rd)",
      "Tackles (Mid 3rd)",
      "Tackles (Att 3rd)",
      "Dribblers Tackled",
      "% of Dribblers Tackled",
      "Dribbles Challenged",
      "Interceptions",
      "Blocks",
      "Clearances",
      "Errors",
      "Ball Recoveries",
      "Tkl+Int",
    ],
  },
  {
    name: "Duels",
    metrics: ["Aerials Won", "Aerials Lost", "% of Aerials Won", "Challenges Lost", "Fouls Committed", "Fouls Drawn"],
  },
  {
    name: "Advanced",
    metrics: [
      "Shot-Creating Actions",
      "SCA (Live-ball Pass)",
      "SCA (Dead-ball Pass)",
      "SCA (Take-On)",
      "SCA (Shot)",
      "SCA (Fouls Drawn)",
      "SCA (Defensive Action)",
      "Goal-Creating Actions",
      "GCA (Live-ball Pass)",
      "GCA (Dead-ball Pass)",
      "GCA (Take-On)",
      "GCA (Shot)",
      "GCA (Fouls Drawn)",
      "GCA (Defensive Action)",
      "npxG + xAG",
    ],
  },
  {
    name: "Discipline",
    metrics: ["Yellow Cards", "Red Cards", "Second Yellow Card", "Offsides"],
  },
]

