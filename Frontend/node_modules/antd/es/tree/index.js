"use client";

import { TreeNode } from '@rc-component/tree';
import DirectoryTree from './DirectoryTree';
import TreePure from './Tree';
const Tree = TreePure;
Tree.DirectoryTree = DirectoryTree;
Tree.TreeNode = TreeNode;
export default Tree;