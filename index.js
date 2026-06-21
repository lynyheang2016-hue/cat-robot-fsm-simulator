//Rule 1: Start/stop
const initialTable = {
    'INIT': {'ST': 'RUNNING', 'SP': 'DEAD', 'Other': 'INIT'},
    'RUNNING': {'ST': 'DEAD', 'SP': 'DONE', 'Other': 'RUNNING'},
    'DONE': {'ST': 'DEAD', 'SP': 'DEAD', 'Other': 'DONE'},
    'DEAD': {'ST': 'DEAD', 'SP': 'DEAD', 'Other': 'DEAD'},
};

//Rule 2: At least one movement F/B
const movedTable = {
    'NO_MOVE': { 'F':'MOVED', 'B':'MOVED', 'Other':'NO_MOVE' },
    'MOVED':   { 'F':'MOVED', 'B':'MOVED', 'Other':'MOVED'   }
};

//Rule 3&4: Pick/Drop at least 1 cycle
const pickDropTable = {
    'FREE_0': {'P': 'HELD_0', 'D': 'DEAD', 'Other': 'FREE_0'},
    'HELD_0': {'P': 'DEAD', 'D': 'FREE_1', 'Other': 'HELD_0'},
    'FREE_1': {'P': 'HELD_1', 'D': 'DEAD', 'Other': 'FREE_1'},
    'HELD_1': {'P': 'DEAD', 'D': 'FREE_1', 'Other': 'HELD_1'},
    'DEAD': {'P': 'DEAD', 'D': 'DEAD', 'Other': 'DEAD'}
};

//Rule 6: Energy (max 3, F/B costs 1, Recharge resets)
const energyTable = {
    'E3': {'M': 'E2', 'C': 'E3', 'Other': 'E3'},
    'E2': {'M': 'E1', 'C': 'E3', 'Other': 'E2'},
    'E1': {'M': 'E0', 'C': 'E3', 'Other': 'E1'},
    'E0': {'M': 'DEAD', 'C': 'E3', 'Other': 'E0'},
    'DEAD': {'M': 'DEAD', 'C': 'E3', 'Other': 'DEAD'}
};

//Rule 10: No consecutive turns
const NoConsecutiveTable = {
    'OK': {'L': 'TURNED', 'R': 'TURNED', 'Other': 'OK'},
    'TURNED': {'L': 'DEAD', 'R': 'DEAD', 'Other': 'OK'},
    'DEAD': {'L': 'DEAD', 'R': 'DEAD', 'Other': 'DEAD'},
};

//Rule 13: Must never complete (F->R) x4
const cwwFRtable = {
    'CW0': {'F': 'CW1', 'R': 'CW0', 'Other': 'CW0'},
    'CW1': {'F': 'CW1', 'R': 'CW2', 'Other': 'CW0'},
    'CW2': {'F': 'CW3', 'R': 'CW0', 'Other': 'CW0'},
    'CW3': {'F': 'CW3', 'R': 'CW4', 'Other': 'CW0'},
    'CW4': {'F': 'CW5', 'R': 'CW0', 'Other': 'CW0'},
    'CW5': {'F': 'CW5', 'R': 'CW6', 'Other': 'CW0'},
    'CW6': {'F': 'CW7', 'R': 'CW0', 'Other': 'CW0'},
    'CW7': {'F': 'CW7', 'R': 'DEAD', 'Other': 'CW0'},
    'DEAD': {'F': 'DEAD', 'R': 'DEAD', 'Other': 'DEAD'}
};

//Rule 14: |L count - R count| must not exceed 2
const absDiffTable = {
    'S_MINUS2': {'L': 'S_MINUS1', 'R': 'DEAD', 'Other': 'S_MINUS2'},
    'S_MINUS1': {'L': 'S0', 'R': 'S_MINUS2', 'Other': 'S_MINUS1'},
    'S0': {'L': 'S1', 'R': 'S_MINUS1', 'Other': 'S0'},
    'S1': {'L': 'S2', 'R': 'S0', 'Other': 'S1'},
    'S2': {'L': 'DEAD', 'R': 'S1', 'Other': 'S2'},
    'DEAD': {'L': 'DEAD', 'R': 'DEAD', 'Other': 'DEAD'}
};

function isAccepting(state){
    return state.initialPhase === 'DONE' &&
           state.movedState === 'MOVED' &&
           state.pickDropPhase === 'FREE_1' &&
           state.cwwFRphase !== 'DEAD' &&
           state.absDiffPhase !== 'DEAD';
}

let currentState = {
    initialPhase: 'INIT',
    movedState: 'NO_MOVE',
    pickDropPhase: 'FREE_0',
    energyPhase: 'E3',
    NoConsecutiveTurnPhase: 'OK',
    cwwFRphase: 'CW0',
    absDiffPhase: 'S0'
};

function returnNextState(currentState, cmd){
    const ekey = (cmd === 'F' || cmd === 'B') ? 'M' : cmd;

    function getKey(table, state, cmd){
        return table[state].hasOwnProperty(cmd) ? cmd : 'Other';
    }
    return{
        'initialPhase': initialTable[currentState.initialPhase][getKey(initialTable, currentState.initialPhase, cmd)],
        'movedState': movedTable[currentState.movedState][getKey(movedTable, currentState.movedState, cmd)],
        'pickDropPhase': pickDropTable[currentState.pickDropPhase][getKey(pickDropTable, currentState.pickDropPhase, cmd)],
        'energyPhase': energyTable[currentState.energyPhase][getKey(energyTable, currentState.energyPhase, ekey)],
        'NoConsecutiveTurnPhase': NoConsecutiveTable[currentState.NoConsecutiveTurnPhase][getKey(NoConsecutiveTable, currentState.NoConsecutiveTurnPhase, cmd)],
        'cwwFRphase': cwwFRtable[currentState.cwwFRphase][getKey(cwwFRtable, currentState.cwwFRphase, cmd)],
        'absDiffPhase': absDiffTable[currentState.absDiffPhase][getKey(absDiffTable, currentState.absDiffPhase, cmd)]
    };
}

const allBtn = document.querySelectorAll('button');
const statePanel = document.querySelector('.state-panel');
const cmdListBox = document.getElementById('cmdListBox');
const cmdList = [];

function displayCmds(){
    cmdListBox.innerHTML = '';
    for(const cmd of cmdList){
        const p = document.createElement('p');
        p.textContent = `Command: ${cmd}`;
        cmdListBox.appendChild(p);
    }
}


function displayState(){
    statePanel.innerHTML = `
        <h3>Current States:</h3>
        <b>Started:</b> ${currentState.initialPhase}<br>
        <b>Moved:</b> ${currentState.movedState}<br>
        <b>Pick/Drop:</b> ${currentState.pickDropPhase}<br>
        <b>Energy:</b> ${currentState.energyPhase}<br>
        <b>Turn rule:</b> ${currentState.NoConsecutiveTurnPhase}<br>
        <b>CW loop:</b> ${currentState.cwwFRphase}<br>
        <b>L/R diff:</b> ${currentState.absDiffPhase}
    `;
}

allBtn.forEach(btn => {
    btn.addEventListener('click', () => {
        const cmd = btn.dataset.cmd;
        let currentInput = cmd;

        if(currentState.initialPhase === 'INIT' && cmd !== 'ST'){
            alert('Rule 1 breached: You must start the simulation with ST(start)');
            return;
        }
        let nextState = returnNextState(currentState, currentInput);
        if(nextState.pickDropPhase === 'DEAD'){
            alert('Rule 3 breached: Invalid Pick/Drop sequence');
            return;
        }
        if(currentInput === 'SP' && nextState.pickDropPhase !== 'FREE_1'){
            alert('Rule 4 breached: You must complete one pick-up drop');
            return;
        }
        if(nextState.energyPhase === 'DEAD'){
            alert('Energy depleted! Please recharge to continue.');
            return;
        }
        if(nextState.NoConsecutiveTurnPhase === 'DEAD'){
            alert('Rule 10: Cannot turn twice in a row');
            return;
        }
        if(nextState.cwwFRphase === 'DEAD'){
            alert('Rule 13 breached: Completed a forbidden clockwise (F->R) x4 loop');
            return;
        }
        if(nextState.absDiffPhase === 'DEAD'){
            alert('Rule 14 is breached: absolute difference between left and right exceeds 2');
            return;
        }

        currentState = nextState;
        cmdList.push(cmd);
        displayCmds();
        runCmd(cmd);
        displayState();

        if (currentInput === 'SP' && isAccepting(currentState)) {
            alert('ACCEPTED');
        }
    });
});

render();
displayState();