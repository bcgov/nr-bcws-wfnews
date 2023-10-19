import { TreeviewItem } from './treeview-item';
export declare const TreeviewHelper: {
    findItem: typeof findItem;
    findItemInList: typeof findItemInList;
    findParent: typeof findParent;
    removeItem: typeof removeItem;
    concatSelection: typeof concatSelection;
};
declare function findItem(root: TreeviewItem, value: any): TreeviewItem;
declare function findItemInList(list: TreeviewItem[], value: any): TreeviewItem;
declare function findParent(root: TreeviewItem, item: TreeviewItem): TreeviewItem;
declare function removeItem(root: TreeviewItem, item: TreeviewItem): boolean;
declare function concatSelection(items: TreeviewItem[], checked: TreeviewItem[], unchecked: TreeviewItem[]): {
    [k: string]: TreeviewItem[];
};
export {};
