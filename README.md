# Robot Navigation Using Finite Automata

A visual simulation of a robot (rendered as a cat collecting wool) navigating an 8×8 grid, where every move is validated by a finite-state automaton before it's allowed to execute.

## Overview

This project models a robot command language as a set of finite automata, then enforces those automata in a live, clickable simulation. The robot starts at the bottom-left of an 8×8 grid, facing forward, and responds to a fixed set of commands (move, turn, pick up, drop, recharge, start, stop). A sequence of commands is only *accepted* if it satisfies every rule encoded in the automaton; otherwise it's rejected at the exact point of violation.

Rather than building one large automaton, each rule is modeled as its own small FSM. On every command, all sub-FSMs transition in parallel (a product automaton), and the overall sequence is valid only if none of them ever reaches a `DEAD` (rejecting) state.

## Rules Enforced

| # | Rule |
|---|------|
| 1 | The sequence must start with **Start** and end with **Stop** |
| 2 | The robot must perform at least one movement (forward or backward) |
| 3 | Picking up an object must occur before dropping it; the robot cannot pick twice without dropping |
| 4 | The robot must complete at least one full pick → drop cycle before Stop |
| 6 | Movement consumes energy (max 3 units); recharge resets energy to full |
| 10 | The robot cannot turn left or right twice in a row |
| 13 | The robot must never complete a clockwise loop: (forward → right) × 4 |
| 14 | At any point, the absolute difference between the number of left turns and right turns must not exceed 2 |

> Rules 5, 7, 8, 9, 11, and 12 from the original assignment brief are intentionally out of scope for this implementation, per project requirements — rules 10, 13, and 14 (which overwrite/extend the base rule set) are used in their place.

## Command Alphabet

| Command | Code | Effect |
|---|---|---|
| Start | `ST` | Begins the sequence |
| Stop | `SP` | Ends the sequence (triggers accept/reject check) |
| Forward | `F` | Move forward one cell, costs 1 energy |
| Backward | `B` | Move backward one cell, costs 1 energy |
| Left | `L` | Turn left |
| Right | `R` | Turn right |
| Pick | `P` | Pick up the wool (only when adjacent to it) |
| Drop wool | `D` | Drop the wool at the robot's current cell |
| Recharge | `C` | Reset energy to full |

## How It Works

- **`returnNextState(state, cmd)`** advances every sub-FSM (start/stop, movement, pick/drop, energy, turn-repetition, clockwise-loop, left/right balance) in lockstep for a given command.
- Each sub-FSM has its own state space and transition table; an unrecognized command for a given state falls back to an `Other` transition.
- If any sub-FSM transitions to `DEAD`, the command is rejected and the robot's state does not advance.
- A sequence is only **accepted** when `Stop` is issued and every relevant sub-FSM is in a valid terminal condition (started and stopped properly, moved at least once, completed a pick/drop cycle, and never violated the turn, loop, or balance constraints).

## Project Structure
.

├── index.html        # Page layout: grid, controls, rules panel, state panel

├── index.css          # Styling for grid, buttons, and side panels

├── index.js           # FSM tables, transition logic, click handling, rule violation alerts

├── simulation.js       # Grid rendering, cat/wool sprite positioning and movement logic


└── assets/            # Cat and wool images
## Running Locally

No build step or dependencies required — this is plain HTML/CSS/JS.

1. Clone the repository
2. Open `index.html` in a browser, or serve the folder with a local dev server (e.g. the VS Code "Live Server" extension)
3. Click **Start**, then issue movement/turn/pick/drop commands, then **Stop** to check whether the sequence is accepted

## UI Features

- **8×8 grid** with a cat sprite representing the robot and a wool sprite representing the object to retrieve
- **Live state panel** showing the current phase of every sub-FSM after each command
- **Rules panel** listing the enforced rules, with the violated rule highlighted when a command is rejected
- **Command log** showing the full history of commands issued in the current sequence
- Alerts for rule violations (energy depletion, invalid pick/drop order, consecutive turns, forbidden loop, turn imbalance) and for sequence acceptance/rejection

## Known Limitations

- Grid boundary clamping (e.g. moving forward at the grid's edge) is handled silently in the simulation layer and does not raise a rule violation, since it isn't one of the modeled FSM rules.
- The energy and turn-balance FSMs are independent of the simulation's visual movement logic; both must be kept in sync manually if behavior is extended.
