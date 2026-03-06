import { useState } from 'react';
import SortingControlsBar from '../components/controls/SortingControlsBar';
import SortingCanvas from '../components/canvas/SortingCanvas';
import SortingStatePanel from '../components/panels/SortingStatePanel';
import MergeSortTreeView from '../components/panels/MergeSortTreeView';
import useSortingVisualizationStore from '../store/sortingVisualizationStore';
import './SortingPage.css';

/*
  SortingPage -- workspace for sorting algorithm visualizations.

  View modes (merge sort only):
    - 'bars'  : bars fill the main area, tree hidden
    - 'tree'  : tree fills the main area, bars become a compact strip above
    - 'split' : (default) bars main + tree in sidebar

  For non-merge-sort algorithms, view mode is ignored (always shows bars).
*/

export default function SortingPage() {
  const [viewMode, setViewMode] = useState('split'); // 'bars' | 'tree' | 'split'
  const { algorithmKey, visualState } = useSortingVisualizationStore();

  const isMergeSort = algorithmKey === 'mergeSort';

  return (
    <div className="sorting-page">
      <SortingControlsBar
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        isMergeSort={isMergeSort}
      />
      <div className="sorting-page__workspace">
        <div className={`sorting-page__canvas-area ${isMergeSort && viewMode === 'tree' ? 'sorting-page__canvas-area--compact' : ''}`}>
          <SortingCanvas compact={isMergeSort && viewMode === 'tree'} />
          {/* In tree mode, show the tree below the compact bars */}
          {isMergeSort && viewMode === 'tree' && visualState.recursionTree && (
            <div className="sorting-page__tree-main">
              <MergeSortTreeView
                tree={visualState.recursionTree}
                array={visualState.array}
                expanded
              />
            </div>
          )}
        </div>
        <SortingStatePanel viewMode={isMergeSort ? viewMode : 'bars'} />
      </div>
    </div>
  );
}
