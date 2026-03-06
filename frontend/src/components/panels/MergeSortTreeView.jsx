import { motion } from 'framer-motion';
import './MergeSortTreeView.css';

/*
  MergeSortTreeView -- renders the recursion / divide-and-conquer tree
  for merge sort.

  Each tree node shows the sub-array range and is color-coded by state:
    - pending    : hasn't been reached yet
    - splitting  : currently being divided
    - merging    : two halves are being merged
    - sorted     : this sub-array is sorted

  The tree is drawn top-down using flexbox nesting.
  Connector lines between parent and children use CSS pseudo-elements.
*/

const stateColors = {
  pending: 'var(--slate-600)',
  splitting: 'var(--accent-cyan)',
  merging: 'var(--accent-amber)',
  sorted: 'var(--sage-500)',
};

const stateLabels = {
  pending: '',
  splitting: 'splitting',
  merging: 'merging',
  sorted: 'sorted',
};

export default function MergeSortTreeView({ tree, array, expanded = false }) {
  if (!tree) return null;

  return (
    <div className={`merge-tree ${expanded ? 'merge-tree--expanded' : ''}`}>
      <div className="merge-tree__title">Recursion Tree</div>
      <div className="merge-tree__container">
        <TreeNode node={tree} array={array} expanded={expanded} />
      </div>
    </div>
  );
}

function TreeNode({ node, array, expanded }) {
  const [l, r] = node.range;
  const subArray = array.slice(l, r + 1);
  const label = l === r ? `[${l}]` : `[${l}..${r}]`;
  const values = subArray.join(', ');

  return (
    <div className="merge-tree__subtree">
      <motion.div
        className="merge-tree__node"
        style={{
          borderColor: stateColors[node.state],
          background: node.state !== 'pending'
            ? `${stateColors[node.state]}22`
            : 'var(--bg-tertiary)',
        }}
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.2 }}
      >
        <span className="merge-tree__node-range">{label}</span>
        <span className="merge-tree__node-values">{values}</span>
        {stateLabels[node.state] && (
          <span
            className="merge-tree__node-state"
            style={{ color: stateColors[node.state] }}
          >
            {stateLabels[node.state]}
          </span>
        )}
      </motion.div>

      {node.children.length > 0 && (
        <div className="merge-tree__children">
          {node.children.map((child, idx) => (
            <TreeNode key={idx} node={child} array={array} expanded={expanded} />
          ))}
        </div>
      )}
    </div>
  );
}
