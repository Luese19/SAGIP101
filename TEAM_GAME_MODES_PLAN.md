# Team-Based Game Modes Implementation Plan

## Overview
Add 1v1, 2v2, and 3v3 team-based game modes to complement existing individual battle modes (CLASSIC, RAPID, SURVIVAL).

## Current Game Structure Analysis
- **Individual Battles**: Each player has health, skills, and competes individually
- **Turn-based**: Players answer questions in sequence
- **Win Condition**: Last player with health > 0 wins
- **Skills**: Direct Shot, Health Steal, Time Bomb affect individual players

## New Team-Based Game Modes Design

### Game Mode Specifications

#### 1v1 Duel
- **Players**: 2 total (1 vs 1)
- **Teams**: 2 teams of 1 player each
- **Max Players**: 2
- **Gameplay**: Direct head-to-head competition
- **Auto-start**: Yes (when room reaches 2 players)

#### 2v2 Team Battle
- **Players**: 4 total (2 vs 2)
- **Teams**: 2 teams of 2 players each
- **Max Players**: 4
- **Gameplay**: Team-based strategy with coordination
- **Auto-start**: Yes (when room reaches 4 players)

#### 3v3 Team Clash
- **Players**: 6 total (3 vs 3)
- **Teams**: 2 teams of 3 players each
- **Max Players**: 6
- **Gameplay**: Large team battles with complex strategy
- **Auto-start**: Yes (when room reaches 6 players)

### Team Assignment Logic
- **Automatic Assignment**: Players are assigned to teams alternately as they join
- **Balanced Teams**: Teams are filled sequentially (Team A: player 1,3,5; Team B: player 2,4,6)
- **Team Colors**: Team A (Blue), Team B (Red)
- **Team Names**: Can be customized or use defaults ("Team Blue", "Team Red")

### Team-Based Scoring System
- **Individual Scoring**: Players still earn skill points for correct answers
- **Team Health**: Combined health pool for the team
- **Team Elimination**: When all players on a team reach 0 health, the team is eliminated
- **Win Condition**: Last team with at least one living player wins

### Modified Gameplay Mechanics

#### Health System
- **Individual Health**: Each player maintains individual health (0-100)
- **Team Health**: Sum of all living team members' health
- **Team Elimination**: Team loses when all members reach 0 health

#### Skills System
- **Target Selection**: Skills can target:
  - Individual players (existing functionality)
  - Entire teams (new: affects all living members of target team)
  - Specific team member
- **Team Skills**: New skills that affect entire teams

#### Turn System
- **Individual Turns**: Players still take individual turns
- **Team Coordination**: Players can strategize within teams
- **Turn Order**: Maintains current turn-based system

### Auto-Start Feature
- **Room Full Detection**: Monitor player count vs max players
- **Automatic Start**: Trigger game start when room reaches capacity
- **No Ready System**: For team modes, skip the ready phase
- **Immediate Start**: Begin game as soon as last player joins

### UI/UX Updates Required

#### Lobby Updates
- **Game Mode Selection**: Add 1v1, 2v2, 3v3 options
- **Player Count Display**: Show current/max players prominently
- **Auto-start Indicator**: Show that game will start automatically when full

#### Game Screen Updates
- **Team Display**: Show team affiliations with colors
- **Team Health Bars**: Display combined team health
- **Team Scores**: Show team-based scoring
- **Team Chat**: Optional team communication feature

#### Room Waiting Screen
- **Team Assignment Display**: Show which team players are on
- **Team Balance**: Display team compositions
- **Auto-start Countdown**: Show countdown when room is full

### Technical Implementation Plan

#### Server-Side Changes (server/index.js)

1. **Update GAME_MODES Configuration**
   ```javascript
   GAME_MODES: {
     // Existing modes...
     ONE_VS_ONE: {
       name: "1v1 Duel",
       maxPlayers: 2,
       timerDuration: 5,
       description: "Head-to-head battle",
       isTeamMode: true,
       teamSize: 1
     },
     TWO_VS_TWO: {
       name: "2v2 Team Battle",
       maxPlayers: 4,
       timerDuration: 5,
       description: "Team-based strategy",
       isTeamMode: true,
       teamSize: 2
     },
     THREE_VS_THREE: {
       name: "3v3 Team Clash",
       maxPlayers: 6,
       timerDuration: 5,
       description: "Epic team warfare",
       isTeamMode: true,
       teamSize: 3
     }
   }
   ```

2. **Add Team Data Structure**
   ```javascript
   // Room data additions
   roomData.teams = {
     teamA: { id: 'A', name: 'Team Blue', color: '#2196F3', players: [] },
     teamB: { id: 'B', name: 'Team Red', color: '#F44336', players: [] }
   }
   roomData.isTeamMode = mode.isTeamMode || false
   ```

3. **Team Assignment Logic**
   - Assign players to teams alternately as they join
   - Update team player lists
   - Broadcast team assignments

4. **Modified Win Conditions**
   - Check for team elimination instead of individual
   - Team wins when opposing team has no living players

5. **Auto-Start Logic**
   - Check player count against maxPlayers
   - Trigger startGame() automatically when full

#### Client-Side Changes

1. **Lobby Component Updates**
   - Add new game mode options
   - Update player count displays
   - Add auto-start indicators

2. **Game Screen Updates**
   - Display team affiliations
   - Show team health bars
   - Update scoring displays

3. **Room Waiting Updates**
   - Show team assignments
   - Display team compositions

### Implementation Phases

#### Phase 1: Core Team Logic
- Add team data structures
- Implement team assignment
- Update win conditions
- Add auto-start functionality

#### Phase 2: UI Updates
- Update lobby interface
- Modify game screens
- Add team displays

#### Phase 3: Enhanced Features
- Team skills
- Team chat
- Advanced team strategies

### Testing Strategy

1. **Unit Tests**
   - Team assignment logic
   - Win condition checks
   - Auto-start functionality

2. **Integration Tests**
   - Full game flow for each mode
   - Client-server communication
   - UI responsiveness

3. **User Acceptance Testing**
   - Playtest each game mode
   - Balance adjustments
   - Performance optimization

### Potential Challenges

1. **Team Balance**: Ensuring fair team assignments
2. **UI Complexity**: Displaying team information clearly
3. **Game Balance**: Adjusting difficulty for team sizes
4. **Network Performance**: Handling more players simultaneously

### Success Metrics

- All team modes function correctly
- Auto-start works reliably
- UI clearly shows team affiliations
- Game remains balanced and fun
- No performance degradation with more players