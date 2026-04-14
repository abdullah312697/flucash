export const CallState = Object.freeze({
  IDLE: "IDLE",
  CALLING: "CALLING",
  RINGING: "RINGING",
  ACCEPTING: "ACCEPTING",
  CONNECTING: "CONNECTING",
  IN_CALL: "IN_CALL",
  REJECTED: "REJECTED",
  ENDED: "ENDED",
  BUSY: "BUSY",
  NO_ANSWER: "NO_ANSWER",
  ERROR: "ERROR"
});

export const CallAction = Object.freeze({
  START_CALL: "START_CALL",
  INCOMING_CALL: "INCOMING_CALL",
  ACCEPT_CALL: "ACCEPT_CALL",
  CONNECTED: "CONNECTED",
  REJECT_CALL: "REJECT_CALL",
  REMOTE_REJECT: "REMOTE_REJECT",
  REMOTE_BUSY: "REMOTE_BUSY",
  NO_ANSWER: "NO_ANSWER",
  END_CALL: "END_CALL",
  ERROR: "ERROR",
  RESET: "RESET"
});

export const initialCallState = {
  state: CallState.IDLE,
  role: null,
  peerId: null,
  incomingCaller: null,
  error: null
};

export function callReducer(state, action) {
  switch (action.type) {
    case CallAction.START_CALL:
      return {
        ...state,
        state: CallState.CALLING,
        role: "CALLER",
        incomingCaller: action.payload,
      };

    case CallAction.INCOMING_CALL:
      return {
        ...state,
        state: CallState.RINGING,
        role: "CALLEE",
        incomingCaller: action.payload,
      };

    case CallAction.ACCEPT_CALL:
      return { ...state, state: CallState.ACCEPTING };

    case CallAction.CONNECTED:
      return { ...state, state: CallState.IN_CALL };

    case CallAction.REJECT_CALL:
      return { ...state, state: CallState.ENDED };

    case CallAction.REMOTE_REJECT:
      return { ...state, state: CallState.REJECTED };

    case CallAction.END_CALL:
      return { ...state, state: CallState.ENDED };

    case CallAction.RESET:
      return initialCallState;

    default:
      return state;
  }
}
