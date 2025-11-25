# Custom Player Limit Feature Plan

## Overview
Allow room hosts to customize the maximum number of players that can join their room, providing more flexibility than the fixed game mode limits.

## Current Limitations
- Player limits are fixed based on game mode (2, 4, or 6 players)
- No flexibility for smaller or larger games
- Team modes have rigid player requirements

## Proposed Solution

### 1. Host-Configurable Player Limits
- **Range**: 2-8 players (reasonable limits for gameplay)
- **Default**: Game mode default (maintains current behavior)
- **Validation**: Must be even for team modes to ensure balanced teams

### 2. UI Enhancements
- **Player Count Selector**: Dropdown/slider in room creation
- **Smart Defaults**: Pre-select based on game mode
- **Validation Feedback**: Show warnings for unbalanced team sizes

### 3. Game Logic Updates
- **Custom Max Players**: Store in room data instead of using mode defaults
- **Dynamic Team Assignment**: Handle uneven player counts gracefully
- **Flexible Win Conditions**: Work with any player count

### 4. Team Mode Considerations
- **Balanced Teams**: Prefer even numbers for fair team distribution
- **Uneven Teams**: Allow but warn about imbalance
- **Auto-Assignment**: Distribute players as evenly as possible

## Implementation Details

### Server Changes
```javascript
// Room data additions
room.customMaxPlayers = customMaxPlayers || mode.maxPlayers
room.effectiveMaxPlayers = Math.min(room.customMaxPlayers, 8) // Cap at 8
```

### Client Changes
- Add player count selector in Lobby.js
- Update room creation to send custom limit
- Modify validation logic
- Update UI displays

### Validation Rules
- Minimum: 2 players
- Maximum: 8 players
- Team modes: Warn if uneven (but allow)
- Individual modes: Any even/odd number allowed

## User Experience

### Room Creation Flow
1. Select game mode
2. Choose player count (with smart defaults)
3. See validation warnings if needed
4. Create room with custom settings

### Room Display
- Show "X/Y Players" where Y is custom limit
- Indicate if room allows more players than default
- Clear visual feedback for room capacity

## Technical Considerations

### Backward Compatibility
- Existing rooms continue to work
- Default behavior unchanged
- Optional feature with fallbacks

### Performance
- No impact on game performance
- Minimal additional data storage
- Efficient validation logic

### Edge Cases
- Host leaves: Transfer custom settings to new host
- Room recreation: Preserve custom settings
- Mixed client versions: Graceful degradation

## Success Metrics

- Hosts can create rooms with custom player limits
- Team balance warnings help prevent unfair games
- UI clearly communicates room capacity
- No breaking changes to existing functionality
- Improved user satisfaction with flexible room creation