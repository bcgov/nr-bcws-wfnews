import {RootState} from "../index";

export const getCurrentRoute = (state: RootState) => (state['router'] && state['router'].state) ? state['router'].state.url : undefined;
