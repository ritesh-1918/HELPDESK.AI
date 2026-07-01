import type { ActionType } from '../interface';
type InternalActionType = ActionType | 'touch';
type ActionTypes = InternalActionType | InternalActionType[];
export default function useAction(action: ActionTypes, showAction?: ActionTypes, hideAction?: ActionTypes): [showAction: Set<InternalActionType>, hideAction: Set<InternalActionType>];
export {};
